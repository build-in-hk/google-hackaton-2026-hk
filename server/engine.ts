// ============================================================
// AetherPet — Deterministic Pet Engine
// ============================================================
// Pure logic layer: state, actions, mood, wander, unlocks, decay.
// No server, no LLM, no UI — just type-safe TypeScript game state.
// ============================================================

// ── Core Enums ──────────────────────────────────────────────

export type Mood =
  | 'euphoric'   // all stats high
  | 'joyful'     // joy + bond high
  | 'content'    // baseline positive
  | 'neutral'    // middle-of-the-road
  | 'lonely'     // low bond, low joy
  | 'hungry'     // hunger critical
  | 'tired'      // energy critical
  | 'anxious'    // hunger + energy both low
  | 'focused'    // high bond, high energy
  | 'affectionate'; // very high bond

export type PetStage = 'egg' | 'baby' | 'youth' | 'adult' | 'elder';

export type Location = 'room' | 'garden' | 'sky' | 'void' | 'sanctuary';

// ── Action Types ────────────────────────────────────────────

export type ActionType =
  | 'feed'
  | 'play'
  | 'talk'
  | 'rest'
  | 'share-feeling';

export interface AetherAction {
  type: ActionType;
  /** Optional intensity modifier: 0.5 = gentle, 1.0 = normal, 1.5 = intense */
  intensity?: number;
}

// ── Stat Deltas (per-action base values) ────────────────────

const ACTION_DELTAS: Record<ActionType, StatDelta> = {
  feed: { hunger: 20, energy: 5, joy: 5, bond: 2 },
  play: { hunger: -12, energy: -18, joy: 22, bond: 8 },
  talk: { hunger: -3, energy: -5, joy: 12, bond: 12 },
  rest: { hunger: -5, energy: 30, joy: 3, bond: 0 },
  'share-feeling': { hunger: 0, energy: -3, joy: 8, bond: 15 },
};

interface StatDelta {
  hunger: number;
  energy: number;
  joy: number;
  bond: number;
}

// ── Unlocks ─────────────────────────────────────────────────

export interface UnlockDef {
  id: string;
  label: string;
  /** Minimum bond threshold to unlock */
  bondThreshold: number;
  /** Additional stat requirements (optional) */
  requires?: Partial<Record<keyof StatDelta, number>>;
}

/** Ordered unlock table — evaluated top-to-bottom, first-match wins. */
export const UNLOCKS: UnlockDef[] = [
  { id: 'hug', label: 'Hug', bondThreshold: 20 },
  { id: 'focus-timer', label: 'Focus Timer', bondThreshold: 35, requires: { energy: 40 } },
  { id: 'journal', label: 'Pet Journal', bondThreshold: 50 },
  { id: 'photo-booth', label: 'Photo Booth', bondThreshold: 65, requires: { joy: 60 } },
  { id: 'garden-pass', label: 'Garden Pass', bondThreshold: 75 },
  { id: 'sky-dance', label: 'Sky Dance', bondThreshold: 85, requires: { energy: 50, joy: 70 } },
  { id: 'sanctuary', label: 'Sanctuary', bondThreshold: 95 },
];

// ── Main State Interface ────────────────────────────────────

export interface AetherPetState {
  // Core stats (0-100)
  hunger: number;
  energy: number;
  joy: number;
  bond: number;

  // Derived context
  mood: Mood;
  location: Location;
  stage: PetStage;

  // Spatial
  position: { x: number; y: number };

  // Progression
  unlocked: string[];
  interactionCount: number;
  history: InteractionEntry[];

  // Timestamps (ms)
  createdAt: number;
  lastActionAt: number;
}

export interface InteractionEntry {
  action: ActionType;
  intensity: number;
  timestamp: number;
  /** Stats snapshot AFTER this action */
  statsAfter: { hunger: number; energy: number; joy: number; bond: number };
}

// ── Utility ─────────────────────────────────────────────────

/** Clamp a number to [min, max]. */
function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

// ── Mood Derivation (deterministic, priority-based) ────────

/**
 * Derive mood from current stats using a fixed priority ladder.
 * Higher-priority conditions override lower ones.
 * Order matters: critical states (tired/hungry/anxious) check first.
 */
export function deriveMood(s: Pick<AetherPetState, 'hunger' | 'energy' | 'joy' | 'bond'>): Mood {
  // Critical deficits take priority
  if (s.energy < 15 && s.hunger < 25) return 'anxious';
  if (s.energy < 15) return 'tired';
  if (s.hunger < 20) return 'hungry';

  // High-bond positive states
  if (s.bond >= 85 && s.joy >= 70 && s.energy >= 50) return 'euphoric';
  if (s.bond >= 85 && s.joy >= 40) return 'affectionate';

  // Focused state (high bond + energy)
  if (s.bond >= 60 && s.energy >= 60) return 'focused';

  // Standard positive moods
  if (s.joy >= 70 && s.bond >= 40) return 'joyful';
  if (s.joy >= 40 && s.bond >= 30) return 'content';

  // Negative but non-critical
  if (s.bond < 20 && s.joy < 30) return 'lonely';

  // Default
  return 'neutral';
}

// ── Position Wander Logic ──────────────────────────────────

/** Mood-specific wander parameters: range (px) and center tendency. */
const WANDER_PROFILES: Record<Mood, { range: number; centerBias: number }> = {
  euphoric:      { range: 30,  centerBias: 0.8 },  // tight happy bounce
  joyful:        { range: 40,  centerBias: 0.6 },
  content:       { range: 50,  centerBias: 0.5 },
  neutral:       { range: 60,  centerBias: 0.4 },
  lonely:        { range: 25,  centerBias: 0.9 },  // stays still, sad
  hungry:        { range: 45,  centerBias: 0.3 },  // paces around
  tired:         { range: 15,  centerBias: 0.95 }, // barely moves
  anxious:       { range: 70,  centerBias: 0.1 },  // erratic, far
  focused:       { range: 20,  centerBias: 0.85 }, // still, concentrated
  affectionate:  { range: 35,  centerBias: 0.7 },
};

/** Viewport centre used as the "home base" for wandering. */
const VIEWPORT = { w: 800, h: 400 };

/**
 * Calculate new position based on mood wander profile.
 * Deterministic-ish: uses the provided seed (or Date.now() for randomness).
 */
export function wanderPosition(
  mood: Mood,
  current: { x: number; y: number },
  seed?: number
): { x: number; y: number } {
  const profile = WANDER_PROFILES[mood];
  const r = seed !== undefined ? seededRandom(seed) : Math.random;

  const dx = (r() - 0.5) * profile.range * 2;
  const dy = (r() - 0.5) * profile.range;

  // Pull toward center based on centerBias
  const cx = VIEWPORT.w / 2;
  const cy = VIEWPORT.h / 2;
  const nx = current.x + dx;
  const ny = current.y + dy;

  return {
    x: Math.round(nx * (1 - profile.centerBias) + cx * profile.centerBias),
    y: Math.round(ny * (1 - profile.centerBias) + cy * profile.centerBias),
  };
}

/** Simple seeded PRNG (mulberry32) for deterministic wander. */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Stage Derivation ───────────────────────────────────────

/**
 * Pet evolves through stages based on total interactions.
 * egg → baby → youth → adult → elder
 */
const STAGE_THRESHOLDS: Record<PetStage, number> = {
  egg: 0,
  baby: 5,
  youth: 25,
  adult: 75,
  elder: 200,
};

export function deriveStage(interactionCount: number): PetStage {
  if (interactionCount >= STAGE_THRESHOLDS.elder) return 'elder';
  if (interactionCount >= STAGE_THRESHOLDS.adult) return 'adult';
  if (interactionCount >= STAGE_THRESHOLDS.youth) return 'youth';
  if (interactionCount >= STAGE_THRESHOLDS.baby) return 'baby';
  return 'egg';
}

// ── Stat Decay (time-based) ────────────────────────────────

/** Decay rates per minute of inactivity. */
const DECAY_PER_MINUTE: StatDelta = {
  hunger: -2.0,
  energy: -1.0,
  joy: -1.5,
  bond: -0.3, // bond decays very slowly
};

const DECAY_INTERVAL_MS = 60_000; // evaluate decay every 60s
const MAX_DECAY_MINUTES = 120; // cap total decay window at 2 hours

/**
 * Apply time-based decay to stats.
 * Returns the same state if not enough time has passed.
 */
export function applyDecay(state: AetherPetState, now?: number): AetherPetState {
  const t = now ?? Date.now();
  const elapsedMs = t - state.lastActionAt;

  if (elapsedMs < DECAY_INTERVAL_MS) return state;

  const minutes = Math.min(elapsedMs / 60_000, MAX_DECAY_MINUTES);
  const decay = (base: number, rate: number) => clamp(base + rate * minutes);

  const newHunger = decay(state.hunger, DECAY_PER_MINUTE.hunger);
  const newEnergy = decay(state.energy, DECAY_PER_MINUTE.energy);
  const newJoy = decay(state.joy, DECAY_PER_MINUTE.joy);
  const newBond = decay(state.bond, DECAY_PER_MINUTE.bond);

  return {
    ...state,
    hunger: newHunger,
    energy: newEnergy,
    joy: newJoy,
    bond: newBond,
    mood: deriveMood({ hunger: newHunger, energy: newEnergy, joy: newJoy, bond: newBond }),
    position: wanderPosition(
      deriveMood({ hunger: newHunger, energy: newEnergy, joy: newJoy, bond: newBond }),
      state.position,
      Math.floor(t / 1000)
    ),
  };
}

// ── Unlock System ──────────────────────────────────────────

/**
 * Evaluate unlock table against current state.
 * Returns new list of unlocked feature IDs.
 */
export function evaluateUnlocks(state: AetherPetState): string[] {
  const unlocked = new Set(state.unlocked);

  for (const u of UNLOCKS) {
    if (unlocked.has(u.id)) continue;
    if (state.bond < u.bondThreshold) continue;

    // Check additional stat requirements
    if (u.requires) {
      const stats = { hunger: state.hunger, energy: state.energy, joy: state.joy, bond: state.bond };
      let met = true;
      for (const [key, threshold] of Object.entries(u.requires)) {
        if ((stats as Record<string, number>)[key] < (threshold as number)) {
          met = false;
          break;
        }
      }
      if (!met) continue;
    }

    unlocked.add(u.id);
  }

  return [...unlocked];
}

// ── Location Derivation ────────────────────────────────────

/** Derive current location based on mood and unlocked features. */
export function deriveLocation(mood: Mood, unlocked: string[]): Location {
  if (unlocked.includes('sanctuary') && (mood === 'euphoric' || mood === 'affectionate')) {
    return 'sanctuary';
  }
  if (unlocked.includes('garden-pass') && (mood === 'joyful' || mood === 'content')) {
    return 'garden';
  }
  if (mood === 'tired' || mood === 'anxious') return 'room';
  if (mood === 'focused') return 'sky';
  if (mood === 'hungry') return 'room';
  return 'room';
}

// ── Action Processor ───────────────────────────────────────

/**
 * Apply an action to a pet state and return the new state.
 * This is the main entry point — pure function, deterministic.
 */
export function processAction(
  sessionId: string,
  state: AetherPetState,
  action: AetherAction,
  now?: number
): AetherPetState {
  const t = now ?? Date.now();
  const intensity = action.intensity ?? 1.0;

  // 1. Apply stat deltas scaled by intensity
  const deltas = ACTION_DELTAS[action.type];
  if (!deltas) return state; // unknown action, no-op

  const newHunger = clamp(state.hunger + Math.round(deltas.hunger * intensity));
  const newEnergy = clamp(state.energy + Math.round(deltas.energy * intensity));
  const newJoy = clamp(state.joy + Math.round(deltas.joy * intensity));
  const newBond = clamp(state.bond + Math.round(deltas.bond * intensity));

  // 2. Derive new mood from updated stats
  const newMood = deriveMood({
    hunger: newHunger,
    energy: newEnergy,
    joy: newJoy,
    bond: newBond,
  });

  // 3. Calculate new position via wander
  const newPos = wanderPosition(newMood, state.position, t);

  // 4. Update interaction history
  const entry: InteractionEntry = {
    action: action.type,
    intensity,
    timestamp: t,
    statsAfter: { hunger: newHunger, energy: newEnergy, joy: newJoy, bond: newBond },
  };
  const history = [...state.history.slice(-99), entry]; // keep last 100

  // 5. Build intermediate state
  const intermediate: AetherPetState = {
    ...state,
    hunger: newHunger,
    energy: newEnergy,
    joy: newJoy,
    bond: newBond,
    mood: newMood,
    position: newPos,
    interactionCount: state.interactionCount + 1,
    history,
    lastActionAt: t,
  };

  // 6. Derive stage & location
  const newStage = deriveStage(intermediate.interactionCount);
  const newLocation = deriveLocation(newMood, intermediate.unlocked);

  // 7. Evaluate unlocks
  const newUnlocked = evaluateUnlocks(intermediate);

  return {
    ...intermediate,
    stage: newStage,
    location: newLocation,
    unlocked: newUnlocked,
  };
}

// ── Initial State Factory ──────────────────────────────────

export function createInitialState(now?: number): AetherPetState {
  const t = now ?? Date.now();
  return {
    hunger: 60,
    energy: 65,
    joy: 55,
    bond: 20,
    mood: 'neutral',
    location: 'room',
    stage: 'egg',
    position: { x: VIEWPORT.w / 2, y: VIEWPORT.h / 2 },
    unlocked: [],
    interactionCount: 0,
    history: [],
    createdAt: t,
    lastActionAt: t,
  };
}
