# A2UI Tamagotchi — Agent-Driven Generative Pet

A virtual pet where the AI agent IS the pet. Every pixel you see is generated fresh by Gemini based on the pet's internal state (hunger, happiness, energy, affection), its mood, and your interactions.

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                      BROWSER (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ SCENE VIEW   │  │ STAT BARS    │  │ ACTION BUTTONS   │   │
│  │ • pet-avatar │  │ • hunger     │  │ • feed / play    │   │
│  │ • background │  │ • happiness  │  │ • sleep / talk   │   │
│  │ • thought-bb │  │ • energy     │  │ • hug (unlocked) │   │
│  │ • inventory  │  │ • affection  │  └──────────────────┘   │
│  └──────────────┘  └──────────────┘                          │
└───────────────────────────────────────────────────────────────┘
            │ SSE (phased JSONL)
            ▼
┌───────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐   │
│  │ Game     │  │ State    │  │ Gemini Agent             │   │
│  │ Engine   │──▶│ Store    │──▶│ (generative UI only)   │   │
│  │ (determ.)│  │ (in-mem) │  │                          │   │
│  └──────────┘  └──────────┘  └──────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Features

- **Deterministic game engine** — Pet state is computed in pure JS (no LLM for logic)
- **Generative UI** — Gemini generates A2UI JSON for each scene update
- **Phased streaming** — 3-phase SSE: thinking → transition → final scene
- **CSS animations** — Pet moves smoothly via React reconciliation + CSS transitions
- **Unlock system** — New components (hug button, crown, toy-ball) appear based on stats thresholds
- **8 moods** — happy, sad, sleepy, excited, hungry, neutral, grumpy, dance
- **5 locations** — room, park, bedroom, void, golden-room

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + A2UI renderer |
| Backend | Express + TypeScript (tsx) |
| AI | Google Gemini 2.0 Flash |
| Streaming | Server-Sent Events (SSE) |
| Animation | CSS transitions & keyframes |

## Getting Started

### Prerequisites
- Node.js 18+
- A Google Cloud API key with Gemini access

### Installation

```bash
cd a2ui-tamagotchi
npm install
```

### Development

```bash
# Terminal 1 — Server
PORT=3000 npx tsx watch server/index.ts

# Terminal 2 — Client
npx vite
```

Or run both with:

```bash
npm run dev
```

### Build & Production

```bash
npm run build
npm run preview
```

## Game Engine

The game engine handles all pet logic deterministically:

### Actions & Effects

| Action | Hunger | Happiness | Energy | Affection | Location |
|--------|--------|-----------|--------|-----------|----------|
| feed | +25 | +5 | +5 | +3 | room |
| play | -15 | +20 | -20 | +5 | park |
| sleep | -10 | +0 | +40 | +2 | bedroom |
| talk | -5 | +10 | -5 | +8 | room |
| hug | -5 | +15 | -5 | +15 | room |

### Mood Derivation

Priority order: sleepy → hungry → excited → happy → sad → grumpy → neutral

### Decay

Every 30 seconds without interaction: hunger -3, happiness -2, energy -1.
This creates urgency — neglect your pet and it gets sad!

### Unlock System

| Threshold | Unlocks |
|-----------|---------|
| Affection ≥ 80 | Hug button |
| Happiness ≥ 60 | Toy-ball (inventory) |
| Affection ≥ 90 | Crown (inventory) |
| Total interactions ≥ 20 | Golden room background |
| Happiness ≥ 90 & Energy ≥ 60 | Dance expression |

## A2UI Component Catalog

The Gemini agent can generate these components:

1. **scene** — Viewport container (800×400)
2. **background** — Full-bleed gradient (varies by location/mood)
3. **pet-avatar** — Animated circle with expression, position, size
4. **stat-bars** — Four progress bars for stats
5. **thought-bubble** — Floating text above the pet
6. **action-palette** — Grid of action buttons
7. **inventory-slot** — Collected items display

## File Structure

```
a2ui-tamagotchi/
├── server/
│   ├── index.ts           # Express server + SSE streaming
│   ├── game-engine.ts     # Pet state, actions, mood, unlocks
│   ├── state-store.ts     # In-memory session storage
│   ├── agent.ts           # Gemini UI generation wrapper
│   ├── director.ts        # Creative director — templates & prompts
│   ├── thoughts.ts        # Thought text templates
│   ├── catalog-definition.ts  # Component catalog for prompts
│   └── templates.ts       # Golden pre-rendered A2UI JSON
│
├── src/
│   ├── a2ui/
│   │   ├── types.ts       # A2UI type definitions
│   │   ├── store.ts       # Surface & data model store
│   │   └── renderer.tsx   # React component registry
│   ├── components/        # (Reserved for future)
│   ├── hooks/
│   │   ├── useAetherStream.ts  # SSE client hook
│   │   └── index.ts
│   ├── game/              # (Reserved for future)
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles + animations
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## API

### POST /api/actions/:sessionId

Streams phased A2UI updates:
- **Phase 1 (0ms):** Thinking bubble appears
- **Phase 2 (400ms):** Pet transitions
- **Phase 3 (800ms):** Complete scene update + data model

```json
{ "action": "feed" }
```

### POST /api/pets/:sessionId/reset

Resets the pet to initial state.

### GET /api/health

Health check with session count.

## Demo Script (2 Minutes)

1. **0:00-0:15** — Show the pet in neutral state with thought bubble
2. **0:15-0:30** — Click "Feed" — watch thinking bubble → pet moves → stats morph
3. **0:30-0:50** — Click "Play" 3x rapidly — pet gets excited, bounces around
4. **0:50-1:10** — Click "Sleep" — pet moves to bedroom, shrinks, energy fills
5. **1:10-1:30** — Reveal the unlock: after high affection, the hug button appears
6. **1:30-2:00** — Closing: "Every pixel is generated by the agent"

## Design Decisions

### Hybrid Architecture (Game Engine + Gemini)
The game engine handles stat changes instantly for responsive UX, while Gemini focuses on creative UI generation. This is more reliable and cheaper than pure LLM-driven logic.

### CSS Over JS Animation
A2UI describes target states; React reconciles props; CSS transitions handle the in-between. No framer-motion or GSAP needed.

### In-Memory State
Simple for hackathon; session-scoped pets; persists to localStorage on frontend.

## License

MIT
