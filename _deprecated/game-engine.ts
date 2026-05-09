// ============================================================
// game-engine.ts — Pet state logic, mood calc, unlocks, position
// ============================================================

import type {
  Mood,
  PetStage,
  Location,
  ActionType,
  AetherAction,
} from '../engine';

const ACTION_DELTAS: Record<ActionType, { hunger: number; energy: number; joy: number; bond: number }> = {
  feed:    { hunger: 20, energy: 5,  joy: 5,  bond: 2 },
  play:    { hunger: -12, energy: -18, joy: 22, bond: 8 },
  talk:    { hunger: -3, energy: -5, joy: 12, bond: 12 },
  rest:    { hunger: -5, energy: 30, joy: 3, bond: 0 },
  'share-feeling': { hunger: 0, energy: -3, joy: 8, bond: 15 },
};

interface StatDelta {
  hunger: number;
  energy: number;
  joy: number;
  bond: number;
}

export function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

// ── Mood Derivation (deterministic, priority-based) ────────────────

export function deriveMood(s: Pick<StatDelta, 'hunger' | 'energy' | 'joy'>): Mood {
  if (s.energy < 15 && s.hunger < 25) return 'anxious';
  if (s.energy < 15) return 'tired';
  if (s.hunger < 20) return 'hungry';

  if (s.joy >= 70 && s.bond >= 60 && s.energy >= 50) return 'euphoric';
  if (s.joy >= 40 && s.bond >= 30) return 'joyful';
  if (s.bond >= 85 && s.joy >= 70 && s.energy >= 50) return 'affectionate';

  if (s.bond >= 60 && s.energy >= 60) return 'focused';
  if (s.joy >= 40 && s.bond >= 30) return 'content';

  if (s.bond < 20 && s.joy < 30) return 'lonely';

  return 'neutral';
}

// ── Action Processor ───────────────────────────────────────

export function processAction(
  state: AetherPetState,
  action: AetherAction,
  now?: number
): AetherPetState {
  const t = now ?? Date.now();
  const intensity = action.intensity ?? 1.0;

  const deltas = ACTION_DELTAS[action.type];
  if (!deltas) return state;

  const newHunger = clamp(state.hunger + Math.round(deltas.hunger * intensity));
  const newEnergy = clamp(state.energy + Math.round(deltas.energy * intensity));
  const newJoy = clamp(state.joy + Math.round(deltas.joy * intensity));
  const newBond = clamp(state.bond + Math.round(deltas.bond * intensity));

  const newMood = deriveMood({ hunger: newHunger, energy: newEnergy, joy: newJoy });
  const newPos = wanderPosition(newMood, state.position);
  const newStage = deriveStage(state.interactionCount + 1);
  const newLocation = deriveLocation(newMood, state.unlocked);
  const newUnlocked = evaluateUnlocks({ ...state, joy: newJoy, bond: newBond });

  const entry: InteractionEntry = {
    action: action.type,
    intensity,
    timestamp: t,
    statsAfter: { hunger: newHunger, energy: newEnergy, joy: newJoy, bond: newBond },
  };
  const history = [...state.history.slice(-99), entry];

  return {
    ...state,
    hunger: newHunger,
    energy: newEnergy,
    joy: newJoy,
    bond: newBond,
    mood: newMood,
    location: newLocation,
    stage: newStage,
    position: newPos,
    interactionCount: state.interactionCount + 1,
    history,
    lastActionAt: t,
    unlocked: newUnlocked,
  };
}

export function applyDecay(state: AetherPetState): AetherPetState {
  const elapsedMs = Date.now() - state.lastActionAt;
  if (elapsedMs < 60_000) return state;

  const minutes = Math.min(elapsedMs / 60_000, 120);
  const decay = (base: number, rate: number) => clamp(base + rate * minutes);

  return {
    ...state,
    hunger: decay(state.hunger, -2),
    energy: decay(state.energy, -1),
    joy: decay(state.joy, -1.5),
    bond: decay(state.bond, -0.3),
    mood: deriveMood({
      hunger: state.hunger,
      energy: state.energy,
      joy: state.joy,
    }),
  };
}

// ── Unlocks ─────────────────────────────────────────────────

export interface UnlockDef {
  id: string;
  label: string;
  bondThreshold: number;
  requires?: Partial<Record<keyof StatDelta, number>>;
}

const UNLOCKS: UnlockDef[] = [
  { id: 'hug', label: 'Hug', bondThreshold: 20 },
  { id: 'focus-timer', label: 'Focus Timer', bondThreshold: 35, requires: { energy: 40 } },
  { id: 'journal', label: 'Pet Journal', bondThreshold: 50 },
  { id: 'photo-booth', label: 'Photo Booth', bondThreshold: 65, requires: { joy: 60 } },
  { id: 'garden-pass', label: 'Garden Pass', bondThreshold: 75 },
  { id: 'sky-dance', label: 'Sky Dance', bondThreshold: 85, requires: { energy: 50, joy: 70 } },
  { id: 'sanctuary', label: 'Sanctuary', bondThreshold: 95 },
];

export function evaluateUnlocks(state: AetherPetState): string[] {
  const unlocked = new Set(state.unlocked);
  for (const u of UNLOCKS) {
    if (unlocked.has(u.id)) continue;
    if (state.bond < u.bondThreshold) continue;
    if (u.requires) {
      const stats = { hunger: state.hunger, energy: state.energy, joy: state.joy, bond: state.bond };
      let met = true;
      for (const [key, threshold] of Object.entries(u.requires)) {
        if ((stats as Record<string, number>)[key] < threshold) { met = false; break; }
      }
      if (!met) continue;
    }
    unlocked.add(u.id);
  }
  return [...unlocked];
}

// ── Location Derivation ────────────────────────────────────

export function deriveLocation(mood: Mood, unlocked: string[]): Location {
  if (unlocked.includes('sanctuary') && (mood === 'euphoric' || mood === 'affectionate')) return 'sanctuary';
  if (unlocked.includes('garden-pass') && (mood === 'joyful' || mood === 'content')) return 'garden';
  if (mood === 'tired' || mood === 'anxious') return 'room';
  if (mood === 'focused') return 'sky';
  return 'room';
}

// ── Stage Derivation ───────────────────────────────────────

export type PetStage = 'egg' | 'baby' | 'youth' | 'adult' | 'elder';
const STAGE_THRESHOLDS: Record<PetStage, number> = { egg: 0, baby: 5, youth: 25, adult: 75, elder: 200 };

export function deriveStage(count: number): PetStage {
  if (count >= 200) return 'elder';
  if (count >= 75) return 'adult';
  if (count >= 25) return 'youth';
  if (count >= 5) return 'baby';
  return 'egg';
}

// ── Position Wander ────────────────────────────────────────

const WANDER_PROFILES: Record<Mood, { range: number; centerBias: number }> = {
  euphoric:    { range: 30,  centerBias: 0.8 },
  joyful:      { range: 40,  centerBias: 0.6 },
  content:     { range: 50,  centerBias: 0.5 },
  neutral:     { range: 60,  centerBias: 0.4 },
  lonely:      { range: 25,  centerBias: 0.9 },
  hungry:      { range: 45,  centerBias: 0.3 },
  tired:       { range: 15,  centerBias: 0.95 },
  anxious:     { range: 70,  centerBias: 0.1 },
  focused:     { range: 20,  centerBias: 0.85 },
  affectionate:{ range: 35,  centerBias: 0.7 },
};

const VIEWPORT = { w: 800, h: 400 };

export function wanderPosition(
  mood: Mood,
  current: { x: number; y: number },
  seed?: number
): { x: number; y: number } {
  const profile = WANDER_PROFILES[mood];
  const r = seed !== undefined ? seededRandom(seed) : Math.random;

  const dx = (r() - 0.5) * profile.range * 2;
  const dy = (r() - 0.5) * profile.range;

  const cx = VIEWPORT.w / 2, cy = VIEWPORT.h / 2;
  const nx = current.x + dx, ny = current.y + dy;

  return {
    x: Math.round(nx * (1 - profile.centerBias) + cx * profile.centerBias),
    y: Math.round(ny * (1 - profile.centerBias) + cy * profile.centerBias),
  };
}

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

// ── Types ─────────────────────────────────────────────────

export interface AetherPetState {
  hunger: number;
  energy: number;
  joy: number;
  bond: number;
  mood: Mood;
  location: Location;
  stage: PetStage;
  position: { x: number; y: number };
  unlocked: string[];
  interactionCount: number;
  history: InteractionEntry[];
  createdAt: number;
  lastActionAt: number;
}

export interface InteractionEntry {
  action: ActionType;
  intensity: number;
  timestamp: number;
  statsAfter: { hunger: number; energy: number; joy: number; bond: number };
}

export function createInitialState(): AetherPetState {
  const t = Date.now();
  return {
    hunger: 60, energy: 65, joy: 55, bond: 20,
    mood: 'neutral', location: 'room', stage: 'egg',
    position: { x: 400, y: 200 },
    unlocked: [], interactionCount: 0, history: [],
    createdAt: t, lastActionAt: t,
  };
}
