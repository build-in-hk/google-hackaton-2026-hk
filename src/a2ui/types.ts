// ============================================================================
// A2UI Type Definitions for AetherPet
// ============================================================================
// Extends the core A2UI spec with:
// - Flat adjacency list support (parentId for tree reconstruction)
// - Typed custom AetherPet component props
// - Trusted catalog mapping (string type -> component metadata)
// - Full surface/data model message protocol
// ============================================================================

// --- Core A2UI Component Model ---

/**
 * Base A2UI component with flat adjacency list support.
 * Uses parentId instead of nested children so the agent can
 * emit components in any order and the renderer reconstructs the tree.
 */
export interface A2UIComponent {
  /** Stable identifier preserved across surface updates for animation. */
  id: string;
  /** Parent component ID (null/undefined = root-level). */
  parentId?: string | null;
  /** The component type string that maps to the trusted catalog. */
  type: string;
  /** Component-specific props (schema defined by catalog entry). */
  props: Record<string, unknown>;
}

/**
 * Legacy wire-format from Gemini agent (for backward compat).
 * Normalized to A2UIComponent at the store layer.
 */
export interface A2UIWireComponent {
  id: string;
  component: Record<string, unknown>;
}

// --- Surface Protocol Messages ---

export interface SurfaceUpdate {
  surfaceId: string;
  components: A2UIWireComponent[];
  replace?: boolean;
}

export interface DataModelUpdate {
  stats?: {
    hunger: number;
    happiness: number;
    energy: number;
    affection: number;
  };
  data?: Record<string, unknown>;
}

export interface BeginRendering {
  surfaceId: string;
  root?: string;
}

/**
 * Full SSE payload as sent by the server.
 * Any combination of fields may be present per event.
 */
export interface A2UIPayload {
  surfaceUpdate?: SurfaceUpdate;
  dataModelUpdate?: DataModelUpdate;
  beginRendering?: BeginRendering;
}

// --- AetherPet Custom Component Catalog ---

export interface CatalogEntry {
  label: string;
  acceptsChildren: boolean;
  propsSchema: Record<string, { type: string; required?: boolean; description: string }>;
}

export type AetherCatalog = Record<string, CatalogEntry>;

// --- AetherPet Component Prop Types (typed for React) ---

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

// --- Resolved Tree ---

export interface TreeNode {
  component: A2UIComponent;
  children: TreeNode[];
}

// --- Stream Lifecycle ---

export type StreamPhase = 'idle' | 'thinking' | 'transition' | 'rendering' | 'done';

export interface StreamState {
  phase: StreamPhase;
  isStreaming: boolean;
  lastError: string | null;
}
