// Custom component catalog definition for Gemini prompts
export const COMPONENT_CATALOG = {
  scene: {
    description: 'Viewport container with relative positioning',
    properties: ['width', 'height', 'children'],
  },
  background: {
    description: 'Full-bleed gradient backdrop',
    variants: ['room', 'park', 'bedroom', 'void', 'golden-room'],
    properties: ['variant', 'moodTint'],
  },
  'pet-entity': {
    description: 'Animated pet character',
    sizes: ['small' /* 48px */, 'normal' /* 64px */, 'big' /* 80px */],
    expressions: ['neutral', 'happy', 'sad', 'sleepy', 'excited', 'hungry', 'grumpy', 'dance'],
    properties: ['x', 'y', 'size', 'expression', 'id'],
  },
  'stat-bars': {
    description: 'Horizontal progress bars for pet stats',
    stats: ['hunger', 'happiness', 'energy', 'affection'],
    properties: ['hunger', 'happiness', 'energy', 'affection'],
  },
  'thought-bubble': {
    description: 'Floating text bubble above pet',
    properties: ['text', 'visible'],
  },
  'action-palette': {
    description: 'Grid of action buttons',
    actions: ['feed', 'play', 'sleep', 'talk', 'hug', 'rest', 'share-feeling'],
    properties: ['actions'],
  },
  'inventory-slot': {
    description: 'Collected items display',
    properties: ['items'],
  },
  'mood-orb': {
    description: 'Mood indicator orb with floating animation',
    properties: ['mood', 'size'],
  },
  'unlock-toast': {
    description: 'Unlock notification toast',
    properties: ['unlocks'],
  },
};
