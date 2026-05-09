# A2UI Tamagotchi — Architecture Document

## System Architecture

### High-Level Flow

```
User Action (click "Feed")
  │
  ▼
SSE POST → /api/actions/:sessionId
  │
  ├──▶ Game Engine: apply action rules
  │     hunger += 25, happiness += 5, ...
  │     deriveMood() → 'happy'
  │     calculateWanderPosition() → new (x,y)
  │     checkUnlocks() → hug-button unlocked!
  │     generateThought() → "Yum! 🍎"
  │
  ├──▶ StateStore: persist updated PetState
  │
  └──▶ Gemini Agent: build prompt, generate A2UI JSON
        (with fallback to golden templates)
        │
        ▼
Server streams SSE phases:
  Phase 1: { surfaceUpdate: thought-bubble "..." }
  Phase 2: { surfaceUpdate: pet-avatar move }
  Phase 3: { surfaceUpdate: full scene + dataModel + beginRendering }
        │
        ▼
React receives → SurfaceStore merges components
  │
  ├──▶ Pet avatar: new x/y → CSS transition (0.6s)
  ├──▶ Background: new variant → CSS transition (0.8s)
  ├──▶ Stat bars: new values → width transition (0.8s)
  └──▶ Action palette: new buttons → pop-in animation
```

### Data Model — PetState

```typescript
interface PetState {
  hunger: number;           // 0-100, decays over time
  happiness: number;        // 0-100
  energy: number;           // 0-100
  affection: number;        // 0-100, grows with interactions
  location: 'room' | 'park' | 'bedroom' | 'void';
  mood: Mood;              // derived from stats
  position: { x, y };      // 0-800, 0-400
  unlockedComponents: string[];
  inventory: string[];
  interactionHistory: [...];
  totalInteractions: number;
  bornAt: number;           // epoch timestamp
  lastInteractionAt: number;
}
```

### Mood Derivation (priority order)

1. **sleepy** — energy < 20
2. **hungry** — hunger < 25
3. **excited** — happiness > 80 && energy > 50
4. **happy** — happiness > 60 && energy > 30
5. **sad** — happiness < 30
6. **grumpy** — hunger < 40 && happiness < 40
7. **neutral** — default

### Mood → Visual Mapping

| Mood | Size | Color | Background | Expression |
|------|------|-------|------------|------------|
| happy | big (80px) | #fbbf24 (gold) | park | (^o^) |
| sad | small (48px) | #93c5fd (blue) | bedroom | (;_;) |
| sleepy | small (48px) | #c4b5fd (lavender) | bedroom | (=^..^=) |
| excited | big (80px) | #f472b6 (pink) | golden-room | (>ω<)!! |
| hungry | normal (64px) | #fb923c (orange) | room | (o_o)~ |
| neutral | normal (64px) | #9ca3af (gray) | room | (-_-) |
| grumpy | normal (64px) | #9ca3af | void | (>_<) |
| dance | big (80px) | rainbow gradient | golden-room | (≧▽≦) |

## Component Architecture

### Server-Side Components

#### Game Engine (`server/game-engine.ts`)
- Pure deterministic JavaScript — no LLM, no side effects
- Handles: applyAction(), deriveMood(), calculateWanderPosition(), checkUnlocks(), applyDecay()
- Exports: createInitialState() for new sessions
- No dependencies on Express or Gemini

#### State Store (`server/state-store.ts`)
- In-memory Map<sessionId, SessionData>
- Thread-safe for single-process usage
- Methods: getOrCreate(), processAction(), getState(), applyDecayToSession()
- Easy to swap for Redis/PostgreSQL later

#### Gemini Agent (`server/agent.ts`)
- Calls Gemini 2.0 Flash with structured system prompt
- Prompt includes: PetState, mood, location, unlocked components, last action, thought text
- Response: A2UI JSON array of { surfaceId, components }
- Fallback: golden templates if Gemini fails

#### Director (`server/director.ts`)
- Orchestrates scene composition
- System prompt for Gemini ("Creative Director")
- Golden template functions per mood
- composeScene() — static scene from state

#### Thought Templates (`server/thoughts.ts`)
- Pre-written thought strings per mood/action
- ~3 variations each, randomly selected
- Neglected state detection (>90s without interaction)

### Client-Side Components

#### A2UI Types (`src/a2ui/types.ts`)
- A2UIComponent — standard component with id + component map
- A2UIWireComponent — wire format from Gemini
- A2UIRenderedComponent — renderer-friendly with type/props
- SurfaceUpdate, DataModelUpdate, A2UIPayload

#### Surface Store (`src/a2ui/store.ts`)
- Maintains Map<surfaceId, SurfaceEntry>
- Merges components by ID (stable IDs = CSS transitions)
- Exposes diffComponents() for animation tracking
- resolveTree() for parent-child relationships

#### Component Registry (`src/a2ui/renderer.tsx`)
Seven custom components:
1. **Scene** — relative container
2. **Background** — gradient with mood tint
3. **PetAvatar** — animated circle (key='pet' for reconciliation)
4. **StatBars** — progress bars
5. **ThoughtBubble** — floating text
6. **ActionPalette** — button grid
7. **InventorySlot** — collected items

#### SSE Hook (`src/hooks/useAetherStream.ts`)
- Subscribes to SSE events
- Parses JSONL stream
- Triggers React re-renders on beginRendering

## Animation Strategy

### Why CSS Over JS Animation

1. A2UI is declarative — target state, not animation sequence
2. React reconciliation + CSS transitions = free animation
3. No framer-motion/gsap dependencies
4. Stable component IDs mean same DOM element persists across updates
5. `transition: left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)` handles everything

### Keyframe Animations

| Animation | Used For | Duration |
|-----------|----------|----------|
| fadeInUp | Thought bubbles, new components | 0.4s |
| fadeOut | Removing thought bubbles | 0.3s |
| popIn | Inventory items appearing | 0.3s (with overshoot) |
| pulse | Thinking state "..." | 1s infinite |
| slideIn | New action buttons | 0.4s |
| dance | Dance expression | 0.6s infinite |

### Pet Avatar Reconciliation

```
Update 1: { id: 'pet', component: { 'pet-avatar': { x: 400, y: 200, size: 'normal' } } }
Update 2: { id: 'pet', component: { 'pet-avatar': { x: 520, y: 180, size: 'big' } } }

React sees same key='pet' → updates props in-place
CSS transitions handle: left, top, width, height, background
```

## SSE Protocol

### Event Format

Each SSE event is a line starting with `data:` containing JSON:

```
data: {"surfaceUpdate":{"surfaceId":"main","components":[...]}}
data: {"dataModelUpdate":{"stats":{"hunger":85.2,"happiness":67.8,...}}}
data: {"beginRendering":{"surfaceId":"main","root":"root"}}
data: {"type":"done"}
```

### Phased Streaming Timeline

```
t=0ms    Thinking bubble "..."
         [surfaceUpdate: thought-bubble]

t=400ms  Transition state (pet moves)
         [surfaceUpdate: pet-avatar position]

t=800ms  Final scene from Gemini
         [surfaceUpdate: full scene + dataModel]
         [beginRendering]

t=900ms  Done event
         [done]
```

## Deployment

### Docker Support
Single-container deployment with Express server serving both API and React app.

### Environment Variables
- `PORT` — HTTP port (default: 3001)
- `GEMINI_API_KEY` — Google Cloud Gemini access key

### Scaling
- Horizontal: Each server handles independent sessions
- State: In-memory; use Redis for multi-instance deployments
- Gemini: Stateless API calls; rate limits apply per key

## Error Handling

| Error | Fallback |
|-------|----------|
| Gemini timeout | Pre-rendered golden templates |
| Invalid JSON from Gemini | Parse markdown block, extract JSON |
| Session expiry | Auto-create new session |
| SSE disconnect | Client auto-reconnects |

## Performance Targets

- Action response: < 1s (thinking + transition)
- Full scene render: < 1.5s (including Gemini)
- CSS transitions: 0.3-0.8s (hardware accelerated)
- Memory per session: ~5KB PetState
- Max sessions: limited by RAM (~10k+ at 5KB each)
