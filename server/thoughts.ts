// ============================================================
// AetherPet — Thought Generation System
// ============================================================
// Deterministic thought strings keyed by mood + action + context.
// No LLM needed — pool-based selection with fallbacks.
// ============================================================

import type { Mood, ActionType, AetherPetState, PetStage } from './engine';

// ── Mood Thoughts ───────────────────────────────────────────

const MOOD_THOUGHTS: Record<Mood, string[]> = {
  euphoric: [
    'Everything is perfect right now! ✨🌟',
    'I feel like I could fly! 🕊️💛',
    'This is the best day ever! 🎉',
    'My heart is overflowing! 💖',
  ],
  joyful: [
    'Life is so beautiful today! ☀️',
    'I love being here with you! 💛',
    'Everything feels right! 🌈',
    'Wishing this moment never ends~ 🌸',
  ],
  content: [
    'Just a peaceful day~ 🍃',
    'Feeling cozy and calm ☁️',
    'Nothing to worry about today 🐾',
    'Taking it easy... 🌿',
  ],
  neutral: [
    'Hmm, what should we do? 🤔',
    'Looking around... 👀',
    'Just hanging out~ 🐾',
    'Waiting for something fun! ✨',
  ],
  lonely: [
    '...is anyone there? 🥺',
    'I miss spending time together... 💙',
    'It feels quiet here... 😔',
    'Come back soon, okay? 🫂',
  ],
  hungry: [
    '*stomach rumbles*... food? 🍽️',
    'I really need something to eat... 😫',
    'My tummy is empty... 🥲',
    'Can we get some snacks? 🍎',
  ],
  tired: [
    'So sleepy... yawn... 😴',
    'My eyes are getting heavy... 🌙',
    'Need to rest for a bit... 💤',
    'Just a little nap... *drools* 😪',
  ],
  anxious: [
    'I don\'t feel so good... 😰',
    'Everything feels wrong right now... 🌧️',
    'I need you... please help... 😢',
    'So uncomfortable... 🥺',
  ],
  focused: [
    'I\'m locked in! 🎯',
    'Let\'s concentrate together! 🧠',
    'Deep focus mode activated! ⚡',
    'Nothing can distract me now! 💪',
  ],
  affectionate: [
    'I love you so much! 🤗💝',
    'You\'re my favorite person in the world! 💖',
    'Come closer, I want to be near you! 🫂',
    'My heart beats for you! 💗',
  ],
};

// ── Action Reactions ────────────────────────────────────────

const ACTION_THOUGHTS: Record<ActionType, string[]> = {
  feed: [
    'Yum! That was delicious! 🍎',
    'So yummy! More please! 🥰',
    'My favorite! 😋',
    'My tummy is so happy now! 😊',
    'Tastes like love! 💛',
  ],
  play: [
    'Wheee! Again again! 🎾',
    'So much fun! 🥳',
    'That was exciting! 💫',
    'Best game ever! 🌟',
    'I\'m getting faster! 🏃',
  ],
  talk: [
    'I love our chats! 💬',
    'Tell me more! I\'m all ears! 👂',
    'You always know what to say! ✨',
    'Our conversations are the best! 🥰',
  ],
  rest: [
    'Zzz... so cozy... 😴',
    'Sweet dreams... 🌙',
    '*yawn* thanks, I needed that 😪',
    'Resting now... goodnight... 💤',
  ],
  'share-feeling': [
    'Thank you for listening to me... 💕',
    'I feel so understood! 🥺💖',
    'Sharing makes everything better! 🌈',
    'You always know how to make me feel safe! 🫂',
    'I trust you with my heart! 💗',
  ],
};

// ── Stage-Specific Thoughts ────────────────────────────────

const STAGE_THOUGHTS: Record<PetStage, string[]> = {
  egg: [
    '*wiggles inside shell* 🥚',
    'Almost ready to hatch... 🐣',
    'It\'s cozy in here! 🥚✨',
  ],
  baby: [
    'Everything is so new! 👀',
    '*giggles* 🍼',
    'I\'m learning so fast! 🌱',
    'Is that you?! *tiny wave* 👋',
  ],
  youth: [
    'I\'m growing up! 💪',
    'So much to explore! 🗺️',
    'Watch this! *does a flip* 🤸',
  ],
  adult: [
    'I know exactly who I am! ✨',
    'We\'ve been through so much together! 💛',
    'Strong and steady! 🌳',
  ],
  elder: [
    'Ah, the memories... 🌅',
    'So grateful for our journey together! 🕊️',
    'Wisdom comes with time... and so does love! 💛',
  ],
};

// ── Neglect Detection ───────────────────────────────────────

/** Generate a thought based on current state and context. */
export function generateThought(
  state: AetherPetState,
  action?: ActionType,
  now?: number
): string {
  const t = now ?? Date.now();
  const secondsSinceAction = (t - state.lastActionAt) / 1000;

  // Neglect override: hasn't been interacted with in a while
  if (secondsSinceAction > 120 && !action) {
    const neglectThoughts = [
      '...hello? Is anyone there? 😢',
      'I\'ve been waiting... 💔',
      '*sits quietly* 🥺',
      'Did you forget about me? 😔',
    ];
    return neglectThoughts[Math.floor(Math.random() * neglectThoughts.length)];
  }

  // Action-specific thought takes priority
  if (action) {
    const pool = ACTION_THOUGHTS[action];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Stage-specific thought for low interaction counts
  if (state.interactionCount < 10 && state.stage !== 'egg') {
    const pool = STAGE_THOUGHTS[state.stage];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Default: mood-based thought
  const pool = MOOD_THOUGHTS[state.mood];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Get a thought that references a specific new unlock. */
export function generateUnlockThought(unlockId: string): string {
  const thoughts: Record<string, string> = {
    'hug': 'I unlocked the ability to hug! Come here! 🤗',
    'focus-timer': 'Let\'s focus together! I\'ll keep you company! ⏱️',
    'journal': 'I have a journal now! I\'ll write about our adventures! 📖',
    'photo-booth': 'Photo time! Let\'s take a picture! 📸',
    'garden-pass': 'The garden is open! Let\'s explore! 🌻',
    'sky-dance': 'I can dance in the sky now! Watch me! 🌌💃',
    'sanctuary': 'We found the sanctuary... it\'s beautiful here! 🏛️✨',
  };
  return thoughts[unlockId] ?? 'Something new unlocked! ✨';
}
