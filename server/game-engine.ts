// ============================================================
// game-engine.ts — Pet state logic, mood calc, unlocks, position
// ============================================================

import type { PetState, Mood } from './types';

const ACTION_EFFECTS: Record<string, Partial<PetState>> = {
  feed: { hunger: 25, happiness: 5, energy: 5, affection: 3 },
  play: { hunger: -15, happiness: 20, energy: -20, affection: 5 },
  sleep: { hunger: -10, energy: 40, affection: 2 },
  talk: { hunger: -5, happiness: 10, energy: -5, affection: 8 },
  hug: { hunger: -5, happiness: 15, energy: -5, affection: 15 },
};

export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function deriveMood(pet: PetState): Mood {
  if (pet.energy < 20) return 'sleepy';
  if (pet.hunger < 25) return 'hungry';
  if (pet.happiness > 80 && pet.energy > 50) return 'excited';
  if (pet.happiness > 60 && pet.energy > 30) return 'happy';
  if (pet.happiness < 30) return 'sad';
  if (pet.hunger < 40 && pet.happiness < 40) return 'grumpy';
  return 'neutral';
}

export function applyAction(pet: PetState, actionName: string): PetState {
  const effects = ACTION_EFFECTS[actionName];
  if (!effects) return pet;

  let newLocation = pet.location;
  if (actionName === 'play') newLocation = 'park' as const;
  if (actionName === 'sleep') newLocation = 'bedroom' as const;

  const newMood = deriveMood({ ...pet, ...effects, location: newLocation });

  const finalHunger = clamp(pet.hunger + (effects.hunger ?? 0), 0, 100);
  const finalHappiness = clamp(pet.happiness + (effects.happiness ?? 0), 0, 100);
  const finalEnergy = clamp(pet.energy + (effects.energy ?? 0), 0, 100);
  const finalAffection = clamp(pet.affection + (effects.affection ?? 0), 0, 100);

  const newState: PetState = {
    ...pet,
    hunger: finalHunger,
    happiness: finalHappiness,
    energy: finalEnergy,
    affection: finalAffection,
    location: newLocation,
    mood: newMood,
    position: calculateWanderPosition(newMood, pet.position),
    totalInteractions: pet.totalInteractions + 1,
    interactionHistory: [
      ...pet.interactionHistory.slice(-50),
      { action: actionName, timestamp: Date.now(), statsAfter: { hunger: finalHunger, happiness: finalHappiness, energy: finalEnergy, affection: finalAffection } },
    ],
  };

  return checkUnlocks(newState);
}

export function calculateWanderPosition(mood: Mood, currentPos: { x: number; y: number }): { x: number; y: number } {
  const wanderAmount: Record<Mood, number> = {
    happy: 200, sad: 150, sleepy: 100, excited: 250,
    hungry: 200, neutral: 180, grumpy: 130, dance: 220,
  };

  const amount = wanderAmount[mood];
  return {
    x: currentPos.x + (Math.random() - 0.5) * amount * 2,
    y: currentPos.y + (Math.random() - 0.5) * amount,
  };
}

export function checkUnlocks(pet: PetState): PetState {
  const unlocked = new Set<string>(pet.unlockedComponents);
  const inventory = [...pet.inventory];

  if (pet.affection >= 80 && !unlocked.has('hug-button')) unlocked.add('hug-button');
  if (pet.happiness >= 60 && !inventory.includes('toy-ball')) inventory.push('toy-ball');
  if (pet.affection >= 90 && !inventory.includes('crown')) {
    inventory.push('crown');
    unlocked.add('crown-display');
  }
  if (pet.totalInteractions >= 20 && !unlocked.has('golden-room-bg')) {
    unlocked.add('golden-room-bg');
  }
  if (pet.happiness >= 90 && pet.energy >= 60 && !unlocked.has('dance-expression')) {
    unlocked.add('dance-expression');
  }

  return { ...pet, unlockedComponents: [...unlocked], inventory };
}

export function applyDecay(pet: PetState): PetState {
  const now = Date.now();
  const elapsed = (now - pet.lastInteractionAt) / 1000;
  if (elapsed < 30) return pet;

  const decayFactor = Math.min(elapsed / 30, 4);
  return {
    ...pet,
    hunger: clamp(pet.hunger - 3 * decayFactor, 0, 100),
    happiness: clamp(pet.happiness - 2 * decayFactor, 0, 100),
    energy: clamp(pet.energy - 1 * decayFactor, 0, 100),
    mood: deriveMood(pet),
  };
}

export function createInitialState(): PetState {
  return {
    hunger: 60, happiness: 60, energy: 70, affection: 30,
    location: 'room' as const, mood: 'neutral' as const, position: { x: 400, y: 200 },
    unlockedComponents: ['hug-button'], inventory: [], interactionHistory: [],
    totalInteractions: 0, bornAt: Date.now(), lastInteractionAt: Date.now(),
  };
}
