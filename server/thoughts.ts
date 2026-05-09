import type { PetState } from './types';

export function generateThought(pet: PetState): string {
  const { mood, hunger, happiness, energy, affection, totalInteractions } = pet;
  
  // Check for neglected state
  const isNeglected = (Date.now() - pet.lastInteractionAt) / 1000 > 90;

  if (isNeglected) {
    return '...hello? Is anyone there? 😢';
  }

  const moodThoughts: Record<string, string[]> = {
    happy: ['I\'m feeling great today! ☀️', 'Everything is wonderful! 💛', 'What a beautiful day! 🌈'],
    sad: ['I miss you... 😢', 'Feeling a bit lonely today... 💙', 'Is everything okay? 🥺'],
    sleepy: ['So sleepy... let me rest... 😴', 'Zzz... almost there... 🌙', 'Eyes getting heavy... ⭐'],
    excited: ['SO EXCITED! SO MUCH ENERGY! ✨', 'Let\'s play! Let\'s play! 🎉', 'I can\'t stop smiling! 💫'],
    hungry: ['*rumble rumble* I need food... 🍽️'],
    neutral: ['Just hanging out~ 🐾', 'Life is peaceful today ☁️', 'Looking around... 👀'],
    grumpy: ['I want to be left alone... 😤', 'Ugh, everything is annoying... 🌧️', '*crosses arms and looks away* 🙁'],
    dance: ['💃🕺✨ DANCE TIME! ✨🕺💃'],
  };

  const thoughts = moodThoughts[mood] || moodThoughts.neutral;
  return thoughts[Math.floor(Math.random() * thoughts.length)];
}

export function getActionThought(action: string, pet: PetState): string {
  const actionThoughts: Record<string, string[]> = {
    feed: ['Yum! That was delicious! 🍎', 'So yummy! More please! 🥰', 'I love this treat! 😋'],
    play: ['Wheee! Let\'s do that again! 🎾', 'So much fun! Play more! 🥳'],
    sleep: ['Zzz... so cozy... 😴', 'Sleepy time... sweet dreams... 🌙'],
    talk: ['I love talking with you! 💬', 'Tell me more! I\'m listening! 👂'],
    hug: ['I feel so loved! 🤗', 'Warm hugs make me happy! 💝'],
  };

  const thoughts = actionThoughts[action] || actionThoughts.talk;
  return thoughts[Math.floor(Math.random() * thoughts.length)];
}
