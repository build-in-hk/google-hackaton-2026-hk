# AetherPet — Creative Director Demo Guide

## 3-Minute Demo Script

This document walks through the **golden path** of the AetherPet demo — the sequence of actions that showcases the Creative Director's ability to dynamically reshape the UI based on the pet's emotional state.

---

## The Golden Path

### Phase 1: Birth — "Hello, Friend!" (0:00 - 0:30)

**Action:** `feed` → `talk` → `hug` (3 quick taps)

**What the Director does:**
1. Detects `totalInteractions` ≤ 5 → selects **goldenFirstBond** template
2. Background: soft room gradient, warm yellow tint
3. Pet is small/normal sized, expression neutral → slight smile
4. Thought bubble: "Hello, Friend!" with golden milestone banner
5. Particle effect: subtle sparkles appear

**Story beats to say:**
> "Meet Aether — our brand-new virtual pet. When we're born, the system greets us with a warm introduction. Look at those golden sparkles — this is the Creative Director deciding that first impressions matter."

**Visual state:**
- Pet avatar: small, neutral color (#9ca3af)
- Background: warm yellow room gradient
- UI: simple, welcoming, minimal
- Milestone banner: "First Bond Formed"

---

### Phase 2: Building Affection — "Full of Love!" (0:30 - 1:15)

**Action:** `hug` → `hug` → `hug` → `hug` (4 rapid hugs)

**What the Director does:**
1. `affection > 80` → selects **goldenLoveOverflow** template
2. Background shifts to warmer, pinker tones
3. Pet grows to "big" size (80px, was 48-64px)
4. Thought bubble: "I feel so loved! 🤗"
5. Particle effect: 8 hearts float around the pet
6. Action palette highlights `hug` with gold border

**Story beats to say:**
> "Now watch what happens as our bond deepens. The Creative Director tracks affection internally — once we hit the threshold, the entire scene transforms. The pet grows bigger, warmer colors flood the screen, and hearts appear everywhere. This isn't hardcoded — it's the Director reading the pet's emotional state and choosing the right visual language."

**Visual state:**
- Pet avatar: big (80px), warm yellow (#fbbf24), glowing
- Background: warm room with pink mood tint
- Particles: hearts floating
- UI: hug action highlighted in gold

---

### Phase 3: The Dance Party — Maximum Joy (1:15 - 2:00)

**Action:** `play` → `play` → `hug` → `dance`

**What the Director does:**
1. `happiness > 80`, `energy > 60`, `mood = excited` → selects **goldenDanceParty**
2. Background: vibrant, multi-color energy
3. Pet: big, expression "excited" or "dance"
4. Particle effect: **rainbow** — 12 particles spreading across 300px
5. Action palette switches to "wave" layout (buttons arc)
6. Title: "🎉 Dance Party!", subtitle: "The pet is dancing with joy!"

**Story beats to say:**
> "When we hit peak happiness and energy, the Creative Director goes all-in. The dance party isn't a static animation — the Director composes an entirely different scene architecture. Notice the action buttons shift to a wave layout, the particles go rainbow, and the title banner announces the celebration. Every pixel is intentional."

**Visual state:**
- Pet avatar: big, expression "excited" (pink #f472b6), intense glow
- Background: vibrant room, high gradient intensity
- Particles: 12 rainbow particles, 300px spread
- Title: "Dance Party!" with golden subtitle
- Action layout: wave arc

---

### Phase 4: The Crisis — "Hungry & Demanding" (2:00 - 2:30)

**Action:** Wait 30 seconds for decay (hunger drops, energy drops)

**What the Director does:**
1. `hunger < 35` → selects **goldenHungry** template
2. Background shifts to warm orange tones
3. Pet: medium size, expression hungry (#fb923c)
4. Thought bubble: "Time to Eat!" → "Getting peckish..."
5. No particles (mood is urgent, not celebratory)
6. Action palette highlights `feed`

**Story beats to say:**
> "Now let's see the Director respond to a problem. As time passes, stats decay and the hunger bar drops. The Creative Director detects this and immediately shifts the scene — the color palette turns urgent orange, the thought bubble commands attention, and the feed action gets highlighted. No user input needed — the system reads the state and adapts."

**Visual state:**
- Pet avatar: normal size, orange (#fb923c), no glow
- Background: warm room, orange mood tint
- Particles: none (urgent mood)
- Action: feed highlighted

---

### Phase 5: Resolution & Celebration — Golden Status (2:30 - 3:00)

**Action:** `feed` → `play` → `hug` (restore all stats above 80)

**What the Director does:**
1. All stats > 80, `totalInteractions` ≥ 20 → selects **goldenGourmetMode**
2. Background: golden room (VIP shimmer)
3. Pet: big, expression "happy", maximum glow (0.6)
4. Particles: 8 stars (golden status)
5. Title: "Royal Treatment" with subtitle "The gold room awaits..."
6. Milestone banner: "Golden Status Achieved"
7. Inventory slot appears (items collected during demo)

**Story beats to say:**
> "And here's the payoff — after building a relationship, the pet reaches its ultimate form: Golden Status. The VIP room unlocks, the pet is at maximum size with maximum glow, and the entire UI celebrates with golden particles. This is the Creative Director's masterpiece — every component, every color, every particle working together to tell a story of growth."

**Visual state:**
- Pet avatar: big, expression "happy" (gold #fbbf24), glow 0.6
- Background: golden-room (shimmering gold gradient)
- Particles: 8 stars
- Title: "Royal Treatment"
- Milestone banner: "Golden Status Achieved"
- Inventory: visible with collected items

---

## Quick Reference: Director Decision Logic

| Condition | Template | Priority |
|-----------|----------|----------|
| `totalInteractions >= 20 && happiness > 80 && energy > 60` | gourmetMode | celebration |
| `mood === dance || (happiness > 75 && energy > 60)` | danceParty | high |
| `hunger < 35` | hungry | medium |
| `affection > 80` | loveOverflow | medium |
| `energy < 30` | sweetDreams | medium |
| `mood === grumpy` | grumpy | medium |
| `happiness < 30` | sad | low |
| `totalInteractions <= 5 && > 0` | firstBond | medium |
| Default (balanced) | peacefulMorning | medium |

---

## Key Technical Notes

1. **Composable architecture** — The Director uses building block primitives (makeScene, makeBackground, etc.) to compose each template. This makes it easy to add new components or modify existing ones without touching the Director logic.

2. **Golden templates are composable** — Each template function receives PetState and returns a full component array. The Director can combine multiple templates if needed.

3. **Gemini integration** — The `director.ts` file also contains a strong system prompt for Gemini that describes every component in detail. When Gemini is available, it generates more nuanced scenes; when not, the golden templates provide a rich fallback.

4. **Particle effects are mood-driven** — The number, type, and spread of particles are all determined by the pet's emotional state, not hardcoded per template.

5. **Size tells a story** — The pet avatar's size (small/normal/big) is a direct function of mood + total interactions, creating a visual progression from newborn to golden status.

6. **The action palette adapts** — Actions are highlighted based on mood (hungry → feed, sad → hug, etc.), and the layout changes (wave for dance, standard for everything else).

---

## Files

- `server/director.ts` — Creative Director, Gemini system prompt, and decision pipeline
- `server/templates.ts` — 10 golden A2UI templates for every mood/stage
- `server/agent.ts` — Original Gemini integration (now enhanced by the Director)
- `server/index.ts` — SSE endpoint (uses Director for scene composition)
