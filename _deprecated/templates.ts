/**
 * Golden A2UI JSON templates — pre-designed scene compositions for every mood/stage.
 * Each template is a function that receives PetState and returns a components array.
 * The director composes these to produce the final scene.
 */

import type { PetState, Mood } from './types';

// ---------------------------------------------------------------------------
// Type helpers

interface A2UIComponent {
  id: string;
  component: Record<string, unknown>;
}

function comp(id: string, component: Record<string, unknown>): A2UIComponent {
  return { id, component };
}

// ---------------------------------------------------------------------------
// Scene templates

const sceneTemplate = (width: number, height: number): A2UIComponent =>
  comp('scene', { scene: { width, height } });

const backgroundMap: Record<Mood, string> = {
  happy: 'park',
  sad: 'bedroom',
  sleepy: 'bedroom',
  excited: 'park',
  hungry: 'room',
  neutral: 'room',
  grumpy: 'void',
  dance: 'golden-room',
};

export function goldenHappy(pet: PetState): A2UIComponent[] {
  return [
    sceneTemplate(800, 400),
    comp('background', { background: { variant: 'park' } }),
    comp('pet-avatar', { 'pet-avatar': { x: 350, y: 180, size: 'big', expression: 'happy', id: 'pet' } }),
    comp('thought-bubble', { 'thought-bubble': { text: "I'm feeling great today! ☀️", visible: true } }),
    comp('stat-bars', { 'stat-bars': { hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy, affection: pet.affection } }),
    comp('action-palette', { 'action-palette': { actions: ['feed', 'play', 'sleep', 'talk'] } }),
  ];
}

export function goldenSad(pet: PetState): A2UIComponent[] {
  return [
    sceneTemplate(800, 400),
    comp('background', { background: { variant: 'bedroom' } }),
    comp('pet-avatar', { 'pet-avatar': { x: 300, y: 200, size: 'small', expression: 'sad', id: 'pet' } }),
    comp('thought-bubble', { 'thought-bubble': { text: "I miss you... 😢", visible: true } }),
    comp('stat-bars', { 'stat-bars': { hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy, affection: pet.affection } }),
    comp('action-palette', { 'action-palette': { actions: ['feed', 'play', 'sleep', 'talk'] } }),
  ];
}

export function goldenExcited(pet: PetState): A2UIComponent[] {
  return [
    sceneTemplate(800, 400),
    comp('background', { background: { variant: 'golden-room' } }),
    comp('pet-avatar', { 'pet-avatar': { x: 400, y: 160, size: 'big', expression: 'dance', id: 'pet' } }),
    comp('thought-bubble', { 'thought-bubble': { text: "💃🕺✨ DANCE TIME! ✨🕺💃", visible: true } }),
    comp('stat-bars', { 'stat-bars': { hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy, affection: pet.affection } }),
    comp('action-palette', { 'action-palette': { actions: ['feed', 'play', 'sleep', 'talk', 'hug'] } }),
  ];
}

export function goldenSleepy(pet: PetState): A2UIComponent[] {
  return [
    sceneTemplate(800, 400),
    comp('background', { background: { variant: 'bedroom' } }),
    comp('pet-avatar', { 'pet-avatar': { x: 350, y: 220, size: 'small', expression: 'sleepy', id: 'pet' } }),
    comp('thought-bubble', { 'thought-bubble': { text: "Zzz... so cozy... 😴", visible: true } }),
    comp('stat-bars', { 'stat-bars': { hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy, affection: pet.affection } }),
    comp('action-palette', { 'action-palette': { actions: ['feed', 'play', 'sleep', 'talk'] } }),
  ];
}

export function goldenHungry(pet: PetState): A2UIComponent[] {
  return [
    sceneTemplate(800, 400),
    comp('background', { background: { variant: 'room' } }),
    comp('pet-avatar', { 'pet-avatar': { x: 320, y: 200, size: 'normal', expression: 'hungry', id: 'pet' } }),
    comp('thought-bubble', { 'thought-bubble': { text: '*rumble rumble* I need food... 🍽️', visible: true } }),
    comp('stat-bars', { 'stat-bars': { hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy, affection: pet.affection } }),
    comp('action-palette', { 'action-palette': { actions: ['feed', 'play', 'sleep', 'talk'] } }),
  ];
}

export function goldenGrumpy(pet: PetState): A2UIComponent[] {
  return [
    sceneTemplate(800, 400),
    comp('background', { background: { variant: 'void' } }),
    comp('pet-avatar', { 'pet-avatar': { x: 340, y: 190, size: 'normal', expression: 'grumpy', id: 'pet' } }),
    comp('thought-bubble', { 'thought-bubble': { text: "Ugh, everything is annoying... 🌧️", visible: true } }),
    comp('stat-bars', { 'stat-bars': { hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy, affection: pet.affection } }),
    comp('action-palette', { 'action-palette': { actions: ['feed', 'play', 'sleep', 'talk'] } }),
  ];
}

// ---------------------------------------------------------------------------
// Director: pick best template based on current state

export function getGoldenScene(pet: PetState): A2UIComponent[] {
  if (pet.mood === 'happy') return goldenHappy(pet);
  if (pet.mood === 'sad') return goldenSad(pet);
  if (pet.mood === 'excited') return goldenExcited(pet);
  if (pet.mood === 'sleepy') return goldenSleepy(pet);
  if (pet.mood === 'hungry') return goldenHungry(pet);
  if (pet.mood === 'grumpy') return goldenGrumpy(pet);
  return goldenHappy(pet);
}
