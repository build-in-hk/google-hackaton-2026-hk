// ============================================================
// A2UI Type System for Tamagotchi
// ============================================================

export interface A2UIComponent {
  id: string;
  component: Record<string, unknown>;
}

/** Wire-format component from Gemini */
export interface A2UIWireComponent {
  id: string;
  component: Record<string, unknown>;
}

/** Extended for renderer use */
export interface A2UIRenderedComponent extends A2UIComponent {
  type?: string;
  props?: Record<string, unknown>;
  parentId?: string;
}

export interface SurfaceUpdate {
  surfaceId: string;
  components: A2UIWireComponent[];
  replace?: boolean;
}

export interface DataModelUpdate {
  stats?: Record<string, number>;
  data?: Record<string, unknown>;
}

export interface A2UIPayload {
  surfaceUpdate?: SurfaceUpdate;
  dataModelUpdate?: DataModelUpdate;
  beginRendering?: {
    surfaceId: string;
    root: string;
  };
}

export interface TreeNode {
  component: A2UIComponent;
  children: TreeNode[];
}
