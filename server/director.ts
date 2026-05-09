/**
 * director.ts — The Creative Director
 * Orchestrates scene composition with golden templates and Gemini prompts.
 */

import type { AetherPetState, Mood, PetStage } from './game-engine';

export const CREATIVE_DIRECTOR_SYSTEM_PROMPT = `You are the Creative Director for A2UI Tamagotchi. Generate A2UI JSON for a pet's current state.

CURRENT PET STATE:
- hunger: ${HUNGER}, energy: ${ENERGY}, joy: ${JOY}, bond: ${BOND}
- mood: ${MOOD}, location: ${LOCATION}, stage: ${STAGE}
- position: x=${X}, y=${Y}
- unlocked: ${UNLOCKED}
- interactionCount: ${INTERACTIONS}

CUSTOM COMPONENT CATALOG:
- scene { width, height } — viewport container
- background { variant: "room"|"park"|"bedroom"|"void"|"golden-room", moodTint? }
- pet-entity { x, y, size: "small"|"normal"|"big", expression, id: "pet" }
- stat-bars { hunger, happiness, energy, affection }
- thought-bubble { text, visible }
- action-palette { actions }
- inventory-slot { items }

RULES:
1. Wrap content in a "scene" component first
2. Position pet-entity using x,y (0-800, 0-400)
3. Size reflects stage: "small"=egg/baby, "normal"=youth/adult, "big"=elder
4. Include thought-bubble with current thought
5. Background variant matches location
6. Output a JSON array of { surfaceId, components } messages`;

function moodToExpression(mood: string): string {
  const map: Record<string, string> = {
    euphoric: 'excited', joyful: 'happy', content: 'happy',
    neutral: 'neutral', lonely: 'sad', hungry: 'hungry',
    tired: 'sleepy', anxious: 'grumpy', focused: 'neutral', affectionate: 'happy',
  };
  return map[mood] || 'neutral';
}

function moodToBackground(mood: string, location: string): string {
  if (location === 'garden') return 'park';
  if (location === 'sky') return 'void';
  if (location === 'sanctuary') return 'golden-room';
  if (mood === 'tired' || mood === 'anxious') return 'bedroom';
  return 'room';
}

export function composeScene(state: AetherPetState) {
  const expression = moodToExpression(state.mood);
  const bgVariant = moodToBackground(state.mood, state.location);

  const sizeMap: Record<PetStage, 'small' | 'normal' | 'big'> = {
    egg: 'small', baby: 'small', youth: 'normal', adult: 'normal', elder: 'big',
  };

  return {
    scene: { width: 800, height: 400 },
    background: bgVariant,
    petPosition: state.position,
    petSize: sizeMap[state.stage] || 'normal',
    petExpression: expression,
    thought: state.mood === 'euphoric' ? 'Everything is perfect right now! ✨🌟' :
             state.mood === 'lonely' ? '...is anyone there? 🥺' :
             state.mood === 'hungry' ? '*stomach rumbles* I need food... 🍽️' :
             state.mood === 'tired' ? 'So sleepy... yawn... 😴' :
             state.mood === 'anxious' ? "I don't feel so good... 😰" :
             state.mood === 'focused' ? "I'm locked in! 🎯" :
             state.mood === 'affectionate' ? "I love you so much! 🤗💝" :
             state.mood === 'joyful' ? 'Life is so beautiful today! ☀️' :
             state.mood === 'content' ? 'Just a peaceful day~ 🍃' :
             state.mood === 'neutral' ? 'Hmm, what should we do? 🤔' :
             state.mood === 'lonely' ? '...is anyone there? 🥺' :
             '...hello? Is anyone there? 😢',
    actions: ['feed', 'play', 'talk', 'rest', 'share-feeling'],
  };
}

// ── Golden Templates ───────────────────────────────────────

export function goldenHappy(state: AetherPetState) {
  return [
    { id: 'scene', component: { scene: { width: 800, height: 400 } } },
    { id: 'background', component: { background: { variant: 'park' } } },
    { id: 'pet-entity', component: { 'pet-entity': { x: state.position.x, y: state.position.y, size: 'big', expression: moodToExpression(state.mood), id: 'pet' } } },
    { id: 'thought-bubble', component: { 'thought-bubble': { text: "I'm feeling great today! ☀️", visible: true } } },
    { id: 'stat-bars', component: { 'stat-bars': { hunger: state.hunger, happiness: state.joy, energy: state.energy, affection: state.bond } } },
    { id: 'action-palette', component: { 'action-palette': { actions: ['feed', 'play', 'talk', 'rest'] } } },
  ];
}

export function goldenSad(state: AetherPetState) {
  return [
    { id: 'scene', component: { scene: { width: 800, height: 400 } } },
    { id: 'background', component: { background: { variant: 'bedroom' } } },
    { id: 'pet-entity', component: { 'pet-entity': { x: state.position.x, y: state.position.y, size: 'small', expression: moodToExpression(state.mood), id: 'pet' } } },
    { id: 'thought-bubble', component: { 'thought-bubble': { text: "I miss you... 😢", visible: true } } },
    { id: 'stat-bars', component: { 'stat-bars': { hunger: state.hunger, happiness: state.joy, energy: state.energy, affection: state.bond } } },
    { id: 'action-palette', component: { 'action-palette': { actions: ['feed', 'play', 'talk', 'rest'] } } },
  ];
}

export function goldenExcited(state: AetherPetState) {
  return [
    { id: 'scene', component: { scene: { width: 800, height: 400 } } },
    { id: 'background', component: { background: { variant: 'golden-room' } } },
    { id: 'pet-entity', component: { 'pet-entity': { x: state.position.x, y: state.position.y, size: 'big', expression: 'dance', id: 'pet' } } },
    { id: 'thought-bubble', component: { 'thought-bubble': { text: '💃🕺✨ DANCE TIME! ✨🕺💃', visible: true } } },
    { id: 'stat-bars', component: { 'stat-bars': { hunger: state.hunger, happiness: state.joy, energy: state.energy, affection: state.bond } } },
    { id: 'action-palette', component: { 'action-palette': { actions: ['feed', 'play', 'talk', 'rest'] } } },
  ];
}

export function goldenSleepy(state: AetherPetState) {
  return [
    { id: 'scene', component: { scene: { width: 800, height: 400 } } },
    { id: 'background', component: { background: { variant: 'bedroom' } } },
    { id: 'pet-entity', component: { 'pet-entity': { x: state.position.x, y: state.position.y, size: 'small', expression: moodToExpression(state.mood), id: 'pet' } } },
    { id: 'thought-bubble', component: { 'thought-bubble': { text: "Zzz... so cozy... 😴", visible: true } } },
    { id: 'stat-bars', component: { 'stat-bars': { hunger: state.hunger, happiness: state.joy, energy: state.energy, affection: state.bond } } },
    { id: 'action-palette', component: { 'action-palette': { actions: ['feed', 'play', 'talk', 'rest'] } } },
  ];
}

export function goldenHungry(state: AetherPetState) {
  return [
    { id: 'scene', component: { scene: { width: 800, height: 400 } } },
    { id: 'background', component: { background: { variant: 'room' } } },
    { id: 'pet-entity', component: { 'pet-entity': { x: state.position.x, y: state.position.y, size: 'normal', expression: moodToExpression(state.mood), id: 'pet' } } },
    { id: 'thought-bubble', component: { 'thought-bubble': { text: '*rumble rumble* I need food... 🍽️', visible: true } } },
    { id: 'stat-bars', component: { 'stat-bars': { hunger: state.hunger, happiness: state.joy, energy: state.energy, affection: state.bond } } },
    { id: 'action-palette', component: { 'action-palette': { actions: ['feed', 'play', 'talk', 'rest'] } } },
  ];
}

export function goldenGrumpy(state: AetherPetState) {
  return [
    { id: 'scene', component: { scene: { width: 800, height: 400 } } },
    { id: 'background', component: { background: { variant: 'void' } } },
    { id: 'pet-entity', component: { 'pet-entity': { x: state.position.x, y: state.position.y, size: 'normal', expression: moodToExpression(state.mood), id: 'pet' } } },
    { id: 'thought-bubble', component: { 'thought-bubble': { text: "I want to be left alone... 😤", visible: true } } },
    { id: 'stat-bars', component: { 'stat-bars': { hunger: state.hunger, happiness: state.joy, energy: state.energy, affection: state.bond } } },
    { id: 'action-palette', component: { 'action-palette': { actions: ['feed', 'play', 'talk', 'rest'] } } },
  ];
}

export function getGoldenScene(state: AetherPetState) {
  if (state.mood === 'euphoric' || state.mood === 'joyful') return goldenHappy(state);
  if (state.mood === 'lonely' || state.mood === 'anxious') return goldenSad(state);
  if (state.mood === 'affectionate') return goldenExcited(state);
  if (state.mood === 'tired') return goldenSleepy(state);
  if (state.mood === 'hungry') return goldenHungry(state);
  return goldenHappy(state);
}
