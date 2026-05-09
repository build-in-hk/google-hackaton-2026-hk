// ============================================================================
// A2UI Type Definitions for AetherPet
// ============================================================================

export interface A2UIComponent {
  id: string;
  parentId?: string | null;
  type: string;
  props: Record<string, unknown>;
}

export interface A2UIWireComponent {
  id: string;
  component: Record<string, unknown>;
}

export interface SurfaceUpdate {
  surfaceId: string;
  components: A2UIWireComponent[];
  replace?: boolean;
}

export interface DataModelUpdate {
  stats?: { hunger: number; happiness: number; energy: number; affection: number };
  data?: Record<string, unknown>;
}

export interface BeginRendering {
  surfaceId: string;
  root?: string;
}

export interface A2UIPayload {
  surfaceUpdate?: SurfaceUpdate;
  dataModelUpdate?: DataModelUpdate;
  beginRendering?: BeginRendering;
}

export interface CatalogEntry {
  label: string;
  acceptsChildren: boolean;
  propsSchema: Record<string, { type: string; required?: boolean; description: string }>;
}

export type AetherCatalog = Record<string, CatalogEntry>;

export interface SceneProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

export interface BackgroundProps {
  variant: 'room' | 'park' | 'bedroom' | 'void' | 'golden-room';
  moodTint?: string;
}

export interface PetAvatarProps {
  x: number;
  y: number;
  size: 'small' | 'normal' | 'big';
  expression: 'neutral' | 'happy' | 'sad' | 'sleepy' | 'excited' | 'hungry' | 'grumpy' | 'dance';
  id?: string;
}

export interface StatBarsProps {
  hunger: number;
  happiness: number;
  energy: number;
  affection: number;
}

export interface ThoughtBubbleProps {
  text: string;
  visible?: boolean;
  thinking?: boolean;
}

export interface ActionPaletteProps {
  actions: string[];
  onAction?: (action: string) => void;
}

export interface InventorySlotProps {
  items: string[];
}

export interface TreeNode {
  component: A2UIComponent;
  children: TreeNode[];
}

export type StreamPhase = 'idle' | 'thinking' | 'transition' | 'rendering' | 'done';

export interface StreamState {
  phase: StreamPhase;
  isStreaming: boolean;
  lastError: string | null;
}
