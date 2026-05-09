// ============================================================================
// A2UI Surface & Data Model Store
// ============================================================================

import type {
  A2UIComponent,
  A2UIWireComponent,
  A2UIRenderedComponent,
  A2UIPayload,
  TreeNode,
  SurfaceUpdate,
  DataModelUpdate,
} from './types';

interface SurfaceEntry {
  surfaceId: string;
  components: Map<string, A2UIComponent>;
  version: number;
}

interface StoreState {
  surfaces: Map<string, SurfaceEntry>;
  currentSurfaceId: string;
  dataModel: Record<string, unknown>;
  pendingSurfaceId: string | null;
}

export interface SurfaceSnapshot {
  surfaceId: string;
  components: A2UIComponent[];
  version: number;
  dataModel: Record<string, unknown>;
}

export class SurfaceStore {
  private state: StoreState = {
    surfaces: new Map(),
    currentSurfaceId: 'main',
    dataModel: {},
    pendingSurfaceId: null,
  };

  processUpdate(payload: A2UIPayload): SurfaceSnapshot | null {
    let changed = false;

    if (payload.surfaceUpdate) {
      changed = this.applySurfaceUpdate(payload.surfaceUpdate) || changed;
    }

    if (payload.dataModelUpdate) {
      this.applyDataModelUpdate(payload.dataModelUpdate);
      changed = true;
    }

    if (payload.beginRendering) {
      this.state.currentSurfaceId = payload.beginRendering.surfaceId;
      this.state.pendingSurfaceId = null;
      changed = true;
    }

    return changed ? this.getSnapshot(this.state.currentSurfaceId) : null;
  }

  private applySurfaceUpdate(update: SurfaceUpdate): boolean {
    const { surfaceId, components, replace } = update;

    let surface = this.state.surfaces.get(surfaceId);
    if (!surface) {
      surface = { surfaceId, components: new Map(), version: 0 };
      this.state.surfaces.set(surfaceId, surface);
    }

    if (replace) {
      surface.components.clear();
    }

    for (const wire of components) {
      const normalized = normalizeWireComponent(wire, surfaceId);
      surface.components.set(normalized.id, normalized);
    }

    surface.version += 1;
    this.state.pendingSurfaceId = surfaceId;

    return true;
  }

  private applyDataModelUpdate(update: DataModelUpdate): void {
    if (update.stats) {
      this.state.dataModel.stats = update.stats;
    }
    if (update.data) {
      Object.assign(this.state.dataModel, update.data);
    }

    if (update.stats) {
      const surface = this.state.surfaces.get(this.state.currentSurfaceId);
      if (surface) {
        const existing = surface.components.get('stat-bars');
        const merged: A2UIRenderedComponent = existing
          ? { ...existing, props: { ...(existing as any).props, ...update.stats } }
          : {
              id: 'stat-bars',
              type: 'stat-bars',
              component: {},
              props: { ...update.stats },
            };
        surface.components.set('stat-bars', merged);
      }
    }
  }

  getSnapshot(surfaceId?: string): SurfaceSnapshot | null {
    const id = surfaceId || this.state.currentSurfaceId;
    const surface = this.state.surfaces.get(id);
    if (!surface) return null;

    return {
      surfaceId: id,
      components: Array.from(surface.components.values()),
      version: surface.version,
      dataModel: { ...this.state.dataModel },
    };
  }

  getCurrentSurfaceId(): string {
    return this.state.currentSurfaceId;
  }

  getSurface(surfaceId: string): SurfaceEntry | undefined {
    return this.state.surfaces.get(surfaceId);
  }

  reset(): void {
    this.state = {
      surfaces: new Map(),
      currentSurfaceId: 'main',
      dataModel: {},
      pendingSurfaceId: null,
    };
  }
}

export function resolveTree(components: A2UIComponent[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const comp of components) {
    nodeMap.set(comp.id, { component: comp, children: [] });
  }

  for (const comp of components) {
    const node = nodeMap.get(comp.id)!;
    const parentId = (comp as any).parentId || (node.component as any).parentId;
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function normalizeWireComponent(wire: A2UIWireComponent, _surfaceId: string): A2UIRenderedComponent {
  const [type, props] = Object.entries(wire.component)[0] || [];

  if (!type || !props) {
    return { id: wire.id, type: wire.id, component: {}, props: {} };
  }

  return { id: wire.id, type, component: {}, props: props as Record<string, unknown> };
}

export function diffComponents(
  prev: A2UIComponent[],
  next: A2UIComponent[],
): { added: Set<string>; updated: Set<string>; removed: Set<string>; } {
  const prevIds = new Set(prev.map((c) => c.id));
  const nextIds = new Set(next.map((c) => c.id));

  const added = new Set<string>();
  const updated = new Set<string>();
  const removed = new Set<string>();

  for (const id of nextIds) {
    if (prevIds.has(id)) updated.add(id);
    else added.add(id);
  }

  for (const id of prevIds) {
    if (!nextIds.has(id)) removed.add(id);
  }

  return { added, updated, removed };
}
