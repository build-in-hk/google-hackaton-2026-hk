// Custom component catalog definition for Gemini prompts
// Includes both base AetherPet components and premium Aether components
export const COMPONENT_CATALOG = {
  // --- Base Components ---
  scene: {
    description: 'Viewport container with relative positioning',
    properties: ['width', 'height', 'children'],
  },
  background: {
    description: 'Full-bleed gradient backdrop',
    variants: ['room', 'park', 'bedroom', 'void', 'golden-room'],
    properties: ['variant', 'moodTint'],
  },
  petAvatar: {
    description: 'Animated pet character',
    sizes: ['small' /* 48px */, 'normal' /* 64px */, 'big' /* 80px */],
    expressions: ['neutral', 'happy', 'sad', 'sleepy', 'excited', 'dance'],
    properties: ['x', 'y', 'size', 'expression', 'id'],
  },
  statBars: {
    description: 'Horizontal progress bars for pet stats',
    stats: ['hunger', 'happiness', 'energy', 'affection'],
    properties: ['hunger', 'happiness', 'energy', 'affection'],
  },
  thoughtBubble: {
    description: 'Floating text bubble above pet',
    properties: ['text', 'visible'],
  },
  actionPalette: {
    description: 'Grid of action buttons',
    actions: ['feed', 'play', 'sleep', 'talk', 'hug'],
    properties: ['actions'],
  },
  inventorySlot: {
    description: 'Collected items display',
    properties: ['items'],
  },

  // --- Premium AetherPet Components ---
  aetherScene: {
    description: 'Cinematic viewport container with mount animation and overflow control',
    properties: ['width', 'height', 'children', 'className', 'overflow'],
  },
  aetherBackground: {
    description: 'Premium gradient morphing backdrop with mood tint overlays and radial light spots',
    variants: ['room', 'park', 'bedroom', 'void', 'golden-room'],
    moods: ['happy', 'sad', 'sleepy', 'excited', 'hungry', 'neutral', 'grumpy', 'dance'],
    properties: ['variant', 'moodTint', 'className'],
  },
  petEntity: {
    description: 'Premium pet avatar with spring-physics movement, breathing pulse, expression-dependent glow/color/face, outer glow ring',
    sizes: ['small', 'normal', 'big'],
    expressions: ['neutral', 'happy', 'sad', 'sleepy', 'excited', 'hungry', 'grumpy', 'dance'],
    properties: ['x', 'y', 'size', 'expression', 'id', 'className'],
  },
  moodOrb: {
    description: 'Floating mood orb with pulsing ring, gentle float animation, and mood label',
    moods: ['happy', 'sad', 'sleepy', 'excited', 'hungry', 'neutral', 'grumpy', 'dance'],
    properties: ['mood', 'size', 'className'],
  },
  thoughtStream: {
    description: 'Elegant speech bubble with tail, thinking dots animation, glass-morphism backdrop',
    properties: ['text', 'visible', 'thinking', 'offsetX', 'offsetY', 'className'],
  },
  vitalHorizon: {
    description: 'Stat bars (hunger/happiness/energy/affection) with gradient fills and shimmer highlight',
    stats: ['hunger', 'happiness', 'energy', 'affection'],
    properties: ['hunger', 'happiness', 'energy', 'affection', 'compact', 'className'],
  },
  actionSanctum: {
    description: 'Dynamic action button grid with hover lift, glass-morphism, icon + label, A2UI action dispatch',
    actions: ['feed', 'play', 'sleep', 'talk', 'hug', 'dance', 'clean', 'gift', 'explore', 'train'],
    properties: ['actions', 'onAction', 'columns', 'className'],
  },
  evolutionInventory: {
    description: 'Inventory grid with item selection, wisdom quotes, and WisdomPortal with XP bar, level display',
    items: ['toy-ball', 'crown', 'star', 'heart', 'cookie', 'crystal', 'feather', 'potion', 'book', 'key', 'shell', 'flower'],
    properties: ['items', 'insights', 'level', 'experience', 'className'],
  },
};
