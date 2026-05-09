/**
 * server/director.ts
 * Orchestrates scene composition with golden templates and Gemini prompts.
 */

import type { PetState, Mood } from './types';
import {
  goldenHappy, goldenSad, goldenExcited, goldenSleepy,
  goldenHungry, goldenGrumpy, getGoldenScene,
} from './templates';

export const CREATIVE_DIRECTOR_SYSTEM_PROMPT = `You are the Creative Director for A2UI Tamagotchi. Generate A2UI JSON for a pet's current state.

CUSTOM COMPONENT CATALOG:
- scene { width, height } — viewport container
- background { variant: "room"|"park"|"bedroom"|"void"|"golden-room", moodTint? }
- pet-avatar { x, y, size: "small"|"normal"|"big", expression, id: "pet" }
- stat-bars { hunger, happiness, energy, affection }
- thought-bubble { text, visible }
- action-palette { actions }
- inventory-slot { items }

RULES:
1. Wrap content in a "scene" component first
2. Position pet-avatar using x,y (0-800, 0-400)
3. Size reflects mood: "small"=sad/sleepy, "normal"=neutral, "big"=happy/excited
4. Include thought-bubble with current thought
5. Background variant matches location
6. Output a JSON array of { surfaceId, components } messages`;

export function composeScene(state: PetState) {
  const mood = state.mood;

  const expressionMap: Record<Mood, string> = {
    happy: 'happy', sad: 'sad', sleepy: 'sleepy', excited: 'excited',
    hungry: 'hungry', neutral: 'neutral', grumpy: 'grumpy', dance: 'dance',
  };

  const sizeMap: Record<Mood, 'small' | 'normal' | 'big'> = {
    happy: 'big', sad: 'small', sleepy: 'small', excited: 'big',
    hungry: 'normal', neutral: 'normal', grumpy: 'normal', dance: 'big',
  };

  const bgMap: Record<Mood, string> = {
    happy: 'park', sad: 'bedroom', sleepy: 'bedroom', excited: 'golden-room',
    hungry: 'room', neutral: 'room', grumpy: 'void', dance: 'golden-room',
  };

  const actions: string[] = ['feed', 'play', 'sleep', 'talk'];
  if (state.unlockedComponents.includes('hug-button')) {
    actions.push('hug');
  }

  return {
    scene: { width: 800, height: 400 },
    background: bgMap[mood] || 'room',
    petPosition: state.position,
    petSize: sizeMap[mood] || 'normal',
    petExpression: expressionMap[mood] || 'neutral',
    thought: generateThought(state),
    actions,
  };
}

function generateThought(pet: PetState): string {
  const isNeglected = (Date.now() - pet.lastInteractionAt) / 1000 > 90;
  if (isNeglected) return '...hello? Is anyone there? 😢';

  const moodThoughts: Record<Mood, string[]> = {
    happy: ["I'm feeling great today! ☀️", "Everything is wonderful! 💛"],
    sad: ['I miss you... 😢', 'Feeling a bit lonely today... 💙'],
    sleepy: ['So sleepy... 😴', "Zzz... almost there... 🌙"],
    excited: ['SO EXCITED! ✨', "Let's play! 🎉"],
    hungry: ['*rumble rumble* I need food... 🍽️'],
    neutral: ['Just hanging out~ 🐾', 'Peaceful today ☁️'],
    grumpy: ["I want to be left alone... 😤", "Ugh... 🌧️"],
    dance: ['💃🕺✨ DANCE TIME! ✨🕺💃'],
  };

  const thoughts = moodThoughts[pet.mood] || moodThoughts.neutral;
  return thoughts[Math.floor(Math.random() * thoughts.length)];
}

export function goldenPeacefulMorning(pet: PetState) { return getGoldenScene(pet); }
export function goldenLoveOverflow(pet: PetState) { return goldenHappy(pet); }
export function goldenDanceParty(pet: PetState) { return goldenExcited(pet); }
export function goldenSweetDreams(pet: PetState) { return goldenSleepy(pet); }
export function goldenMilestone(pet: PetState) { return pet.totalInteractions > 20 ? goldenHappy(pet) : goldenPeacefulMorning(pet); }
export function goldenGourmetMode(pet: PetState) { return goldenHungry(pet); }
export function goldenFirstBond(pet: PetState) { return pet.affection > 50 ? goldenHappy(pet) : goldenPeacefulMorning(pet); }
