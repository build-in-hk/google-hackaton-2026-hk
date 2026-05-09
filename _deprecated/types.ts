export interface PetState {
  hunger: number;
  happiness: number;
  energy: number;
  affection: number;
  location: 'room' | 'park' | 'bedroom' | 'void';
  mood: Mood;
  position: { x: number; y: number };
  unlockedComponents: string[];
  inventory: string[];
  interactionHistory: Array<{ action: string; timestamp: number; statsAfter: Partial<PetState> }>;
  totalInteractions: number;
  bornAt: number;
  lastInteractionAt: number;
}

export type Mood =
  | 'happy'
  | 'sad'
  | 'sleepy'
  | 'excited'
  | 'hungry'
  | 'neutral'
  | 'grumpy'
  | 'dance';
