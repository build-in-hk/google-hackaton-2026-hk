// ============================================================
// AetherPet — Golden Scene Director
// ============================================================
// Pre-authored special scenes for milestone moments.
// These replace AI generation for maximum emotional impact
// during the pet's most important moments.
// ============================================================

import {
  makeScene, makeBackground, makePetAvatar, makeStatBars,
  makeThoughtBubble, makeActionPalette, makeMoodOrb, makeUnlockToast,
  type A2UIComponent,
} from './templates';
import type { AetherPetState } from './engine';

// ── Golden Room Special Scenes ──────────────────────────────

export function goldenPeacefulMorning(state: AetherPetState): A2UIComponent[] {
  return [
    makeScene(800, 480),
    makeBackground('golden-room'),
    makePetAvatar(400, 240, 'big', 'happy'),
    makeThoughtBubble('Good morning, friend! ☀️'),
    makeStatBars(state.hunger, state.joy, state.energy, state.bond),
    makeActionPalette(['feed', 'play', 'talk', 'rest', 'share-feeling']),
    makeMoodOrb('happy', 32),
  ];
}

export function goldenLoveOverflow(state: AetherPetState): A2UIComponent[] {
  return [
    makeScene(800, 480),
    makeBackground('golden-room'),
    makePetAvatar(400, 200, 'big', 'excited'),
    makeThoughtBubble('My heart is SO full! I love you! 💖✨'),
    makeStatBars(state.hunger, state.joy, state.energy, state.bond),
    makeActionPalette(['feed', 'play', 'talk', 'rest', 'share-feeling']),
    makeMoodOrb('excited', 32),
  ];
}

export function goldenDanceParty(state: AetherPetState): A2UIComponent[] {
  return [
    makeScene(800, 480),
    makeBackground('golden-room'),
    makePetAvatar(300, 250, 'big', 'dance'),
    makePetAvatar(500, 250, 'big', 'dance'),
    makeThoughtBubble('DANCE PARTY!!! 💃🕺✨'),
    makeStatBars(state.hunger, state.joy, state.energy, state.bond),
    makeActionPalette(['feed', 'play', 'talk', 'rest', 'share-feeling']),
    makeMoodOrb('dance', 36),
  ];
}

export function goldenSweetDreams(state: AetherPetState): A2UIComponent[] {
  return [
    makeScene(800, 480),
    makeBackground('bedroom'),
    makePetAvatar(400, 280, 'small', 'sleepy'),
    makeThoughtBubble('Sweet dreams... 🌙💤'),
    makeStatBars(state.hunger, state.joy, state.energy, state.bond),
    makeActionPalette(['feed', 'play', 'talk', 'rest', 'share-feeling']),
    makeMoodOrb('sleepy', 24),
  ];
}

export function goldenMilestone(state: AetherPetState, milestone: string): A2UIComponent[] {
  return [
    makeScene(800, 480),
    makeBackground('golden-room'),
    makePetAvatar(400, 200, 'big', 'euphoric'),
    makeThoughtBubble(`🎉 ${milestone}! We did it together! ✨`),
    makeStatBars(state.hunger, state.joy, state.energy, state.bond),
    makeActionPalette(['feed', 'play', 'talk', 'rest', 'share-feeling']),
    makeUnlockToast([milestone]),
    makeMoodOrb('euphoric', 36),
  ];
}

export function goldenGourmetMode(state: AetherPetState): A2UIComponent[] {
  return [
    makeScene(800, 480),
    makeBackground('park'),
    makePetAvatar(400, 240, 'big', 'happy'),
    makeThoughtBubble('Everything tastes better when we share! 🍕🍰🧁'),
    makeStatBars(state.hunger, state.joy, state.energy, state.bond),
    makeActionPalette(['feed', 'play', 'talk', 'rest', 'share-feeling']),
    makeMoodOrb('happy', 28),
  ];
}

export function goldenFirstBond(state: AetherPetState): A2UIComponent[] {
  return [
    makeScene(800, 480),
    makeBackground('room'),
    makePetAvatar(400, 220, 'normal', 'happy'),
    makeThoughtBubble('We just met, but I already feel something special... 💛'),
    makeStatBars(state.hunger, state.joy, state.energy, state.bond),
    makeActionPalette(['feed', 'play', 'talk', 'rest']),
    makeMoodOrb('happy', 24),
  ];
}

// ── Director: picks the right golden scene ──────────────────

interface GoldenTrigger {
  /** Scene function to call */
  scene: (state: AetherPetState) => A2UIComponent[];
  /** Human-readable label */
  label: string;
}

export function getGoldenScene(
  state: AetherPetState,
  action: string,
  newUnlocks: string[],
): GoldenTrigger | null {
  // Sanctuary unlock
  if (newUnlocks.includes('sanctuary') || (state.location === 'sanctuary' && state.bond >= 95)) {
    return { scene: goldenPeacefulMorning, label: 'Sanctuary Discovered' };
  }
  // First bond
  if (state.interactionCount === 1) {
    return { scene: goldenFirstBond, label: 'First Meeting' };
  }
  // Euphoric milestone (all stats high)
  if (state.mood === 'euphoric') {
    return { scene: (s) => goldenMilestone(s, 'Euphoric'), label: 'Euphoric State' };
  }
  // Dance unlock
  if (newUnlocks.includes('sky-dance') && state.energy >= 50) {
    return { scene: goldenDanceParty, label: 'Sky Dance Unlocked' };
  }
  // High bond + joy
  if (state.bond >= 85 && state.joy >= 70) {
    return { scene: goldenLoveOverflow, label: 'Love Overflow' };
  }
  // After rest when tired
  if (action === 'rest' && state.energy >= 80) {
    return { scene: goldenSweetDreams, label: 'Sweet Dreams' };
  }
  // After feed when hungry
  if (action === 'feed' && state.hunger >= 80) {
    return { scene: goldenGourmetMode, label: 'Gourmet Mode' };
  }

  return null;
}
