// ============================================================
// AetherPet — Scene Composition Templates
// ============================================================
// Deterministic scene builders for fallback and special moments.
// These compose the A2UI wire-format that the frontend renders.
// ============================================================

import type { AetherPetState } from './engine';

export interface A2UIComponent {
  id: string;
  component: Record<string, unknown>;
}

// ── Component Factories ─────────────────────────────────────

export function makeScene(width = 800, height = 400): A2UIComponent {
  return { id: 'scene', component: { scene: { width, height } } };
}

export function makeBackground(variant: string, moodTint?: string): A2UIComponent {
  return { id: 'background', component: { background: { variant, moodTint } } };
}

export function makePetAvatar(
  x: number, y: number, size: string, expression: string, id = 'pet'
): A2UIComponent {
  return {
    id: 'pet-entity',
    component: { 'pet-entity': { x, y, size, expression, id } },
  };
}

export function makeStatBars(
  hunger: number, happiness: number, energy: number, affection: number
): A2UIComponent {
  return {
    id: 'stat-bars',
    component: { 'stat-bars': { hunger, happiness, energy, affection } },
  };
}

export function makeThoughtBubble(text: string, visible = true, thinking = false): A2UIComponent {
  return {
    id: 'thought-bubble',
    component: { 'thought-bubble': { text, visible, thinking } },
  };
}

export function makeActionPalette(actions: string[]): A2UIComponent {
  return { id: 'action-palette', component: { 'action-palette': { actions } } };
}

export function makeMoodOrb(mood: string, size = 24): A2UIComponent {
  return { id: 'mood-orb', component: { 'mood-orb': { mood, size } } };
}

export function makeInventorySlot(items: string[]): A2UIComponent {
  return { id: 'inventory-slot', component: { 'inventory-slot': { items } } };
}

export function makeUnlockToast(unlocks: string[]): A2UIComponent {
  return { id: 'unlock-toast', component: { 'unlock-toast': { unlocks } } };
}

// ── Scene Composition ───────────────────────────────────────

/** Compose a full scene from state + thought + action palette. */
export function composeScene(
  state: AetherPetState,
  thought: string,
  actions: string[],
  options?: { showMoodOrb?: boolean; showInventory?: boolean; unlocks?: string[] }
): A2UIComponent[] {
  const exprMap: Record<string, string> = {
    euphoric: 'excited', joyful: 'happy', content: 'happy', neutral: 'neutral',
    lonely: 'sad', hungry: 'hungry', tired: 'sleepy', anxious: 'grumpy',
    focused: 'neutral', affectionate: 'happy',
  };
  const expression = exprMap[state.mood] || 'neutral';
  const sizeMap: Record<string, string> = {
    euphoric: 'big', joyful: 'big', affectionate: 'big',
    content: 'normal', neutral: 'normal', focused: 'normal',
    lonely: 'small', tired: 'small', anxious: 'small', hungry: 'normal',
  };
  const size = sizeMap[state.mood] || 'normal';
  const bgMap: Record<string, string> = {
    garden: 'park', sky: 'void', sanctuary: 'golden-room', room: 'room', void: 'void',
  };
  const bgVariant = bgMap[state.location] || 'room';

  const components: A2UIComponent[] = [
    makeScene(800, 400),
    makeBackground(bgVariant, expression),
    makePetAvatar(state.position.x, state.position.y, size, expression),
    makeThoughtBubble(thought),
    makeStatBars(state.hunger, state.joy, state.energy, state.bond),
    makeActionPalette(actions),
  ];

  if (options?.showMoodOrb) components.push(makeMoodOrb(expression, 28));
  if (options?.showInventory && state.unlocked.length) components.push(makeInventorySlot(state.unlocked));
  if (options?.unlocks?.length) components.push(makeUnlockToast(options.unlocks));

  return components;
}
