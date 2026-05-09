// ============================================================================
// A2UI Component Renderer for AetherPet
// ============================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SurfaceStore, resolveTree, diffComponents, type SurfaceSnapshot } from './store';
import type {
  A2UIComponent, TreeNode, A2UIPayload, StreamPhase,
  SceneProps, BackgroundProps, PetAvatarProps, StatBarsProps,
  ThoughtBubbleProps, ActionPaletteProps, InventorySlotProps,
} from './types';

// ============================================================================
// Component Registry
// ============================================================================

type ComponentFactory = (props: Record<string, unknown>) => React.ReactElement;
const componentRegistry = new Map<string, ComponentFactory>();

export function registerComponent(type: string, factory: ComponentFactory): void {
  componentRegistry.set(type, factory);
}
export function getComponent(type: string): ComponentFactory | undefined {
  return componentRegistry.get(type);
}
export function getRegisteredTypes(): string[] {
  return Array.from(componentRegistry.keys());
}

// ============================================================================
// Built-in Components
// ============================================================================

function Scene({ width = 800, height = 400, children }: SceneProps) {
  return <div style={{ position: 'relative', width: '100%', height, maxWidth: width, margin: '0 auto', overflow: 'hidden', borderRadius: 12, background: '#f8f9fa' }}>{children}</div>;
}

const GRADIENTS: Record<string, string> = {
  room: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  park: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)',
  bedroom: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
  void: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  'golden-room': 'linear-gradient(135deg, #fef9c3 0%, #facc15 100%)',
};
const MOOD_TINTS: Record<string, string> = {
  happy: 'rgba(255,255,0,0.1)', sad: 'rgba(100,100,255,0.1)', sleepy: 'rgba(150,150,255,0.2)',
  excited: 'rgba(255,100,200,0.1)', hungry: 'rgba(255,200,0,0.15)', grumpy: 'rgba(150,100,50,0.1)', dance: 'rgba(255,100,255,0.15)',
};

function Background({ variant = 'room', moodTint }: BackgroundProps) {
  return <div style={{ position: 'absolute', inset: 0, background: GRADIENTS[variant] || GRADIENTS.room, transition: 'background 0.8s ease-in-out', ...(moodTint && MOOD_TINTS[moodTint] ? { boxShadow: `inset 0 0 60px ${MOOD_TINTS[moodTint]}` } : {}) }} />;
}

const AVATAR_SIZES: Record<string, number> = { small: 48, normal: 64, big: 80 };
const AVATAR_SCALES: Record<string, number> = { small: 0.75, normal: 1, big: 1.25 };
const AVATAR_COLORS: Record<string, string> = { neutral: '#9ca3af', happy: '#fbbf24', sad: '#93c5fd', sleepy: '#c4b5fd', excited: '#f472b6', hungry: '#fb923c', grumpy: '#9ca3af', dance: 'linear-gradient(135deg, #fbbf24, #f472b6, #93c5fd)' };
const AVATAR_GLOWS: Record<string, string> = { neutral: '0 4px 12px rgba(0,0,0,0.1)', happy: '0 4px 20px rgba(251,191,36,0.4)', sad: '0 4px 20px rgba(147,197,253,0.4)', sleepy: '0 4px 20px rgba(196,181,253,0.4)', excited: '0 4px 24px rgba(244,114,182,0.5)', hungry: '0 4px 20px rgba(251,146,60,0.4)', grumpy: '0 4px 20px rgba(156,163,175,0.4)', dance: '0 4px 28px rgba(255,100,255,0.5)' };
const AVATAR_FACES: Record<string, string> = { neutral: '(-_-)', happy: '(^o^)', sad: '(;_;)', sleepy: '(=^..^=)', excited: '(>w<)!!', hungry: '(o_o)~', grumpy: '(>_<)', dance: '(V)' };

function PetAvatar({ x = 400, y = 200, size = 'normal', expression = 'neutral', id }: PetAvatarProps) {
  const sz = AVATAR_SIZES[size] ?? AVATAR_SIZES.normal;
  const scale = AVATAR_SCALES[size] ?? 1;
  return (<div key={id || 'pet'} style={{ position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%', background: AVATAR_COLORS[expression] ?? AVATAR_COLORS.neutral, transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)', transform: `scale(${scale})`, boxShadow: AVATAR_GLOWS[expression] ?? AVATAR_GLOWS.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size === 'big' ? 14 : size === 'small' ? 10 : 12, fontFamily: 'monospace', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{AVATAR_FACES[expression] ?? AVATAR_FACES.neutral}</div>);
}

function StatBars({ hunger = 50, happiness = 50, energy = 50, affection = 50 }: StatBarsProps) {
  const stats = [{ label: 'Hunger', value: hunger, color: '#fbbf24', icon: '\uD83C\xDF4E' }, { label: 'Happiness', value: happiness, color: '#34d399', icon: '\uD83D\xDC9B' }, { label: 'Energy', value: energy, color: '#60a5fa', icon: '\u26A1' }, { label: 'Affection', value: affection, color: '#f472b6', icon: '\u2764\uFE0F' }];
  return (<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{stats.map((s) => (<div key={s.label} style={{ padding: '4px 0' }}><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{s.icon} {s.label}: {s.value.toFixed(0)}%</div><div style={{ height: 10, background: '#e5e7eb', borderRadius: 5, overflow: 'hidden' }}><div style={{ width: `${Math.min(100, Math.max(0, s.value))}%`, height: '100%', background: s.color, borderRadius: 5, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} /></div></div>))}</div>);
}

function ThoughtBubble({ text = '...', visible = true, thinking = false }: ThoughtBubbleProps) {
  if (!visible) return null;
  return (<div style={{ position: 'absolute', left: 520, top: 160, background: '#fff', padding: '8px 14px', borderRadius: 16, fontSize: 13, fontFamily: "'Segoe UI', sans-serif", color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', animation: 'fadeInUp 0.4s ease', pointerEvents: 'none', maxWidth: 180 }}>{thinking ? <span style={{ display: 'inline-block', animation: 'pulse 1s infinite' }}>...</span> : text}</div>);
}

const ACTION_ICONS: Record<string, string> = { feed: '\uD83C\xDF4E', play: '\uD83C\xDFBE', sleep: '\uD83C\xDF19', talk: '\uD83D\xDCAC', hug: '\uD83E\uDD17' };
function ActionPalette({ actions = [], onAction }: ActionPaletteProps) {
  return (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>{actions.map((action: string) => (<button key={action} onClick={() => onAction?.(action)} style={{ padding: '10px 16px', border: 'none', borderRadius: 8, background: '#f9fafb', cursor: 'pointer', fontSize: 14, fontFamily: "'Segoe UI', sans-serif", transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}><span>{ACTION_ICONS[action] || '\u2728'}</span><span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{action}</span></button>))}</div>);
}

const ITEM_EMOJIS: Record<string, string> = { 'toy-ball': '\uD83C\xDFBE', crown: '\uD83D\uDC51', star: '\u2B50', heart: '\u2764\uFE0F', cookie: '\uD83C\uDF6A' };
function InventorySlot({ items = [] }: InventorySlotProps) {
  if (!items.length) return <div style={{ display: 'flex', gap: 8, padding: 10, background: 'rgba(255,255,255,0.7)', borderRadius: 8 }}><span style={{ color: '#9ca3af', fontSize: 12 }}>No items yet</span></div>;
  return (<div style={{ display: 'flex', gap: 8, padding: 10, background: 'rgba(255,255,255,0.7)', borderRadius: 8 }}>{items.map((item: string) => (<div key={item} style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', animation: 'popIn 0.3s ease' }}>{ITEM_EMOJIS[item] || '\u2728'}</div>))}</div>);
}

// ============================================================================
// Register Built-ins
// ============================================================================

registerComponent('scene', (p) => <Scene width={p.width as number} height={p.height as number} children={p.children as React.ReactNode} />);
registerComponent('background', (p) => <Background variant={(p.variant as BackgroundProps['variant']) || 'room'} moodTint={p.moodTint as string | undefined} />);
registerComponent('pet-avatar', (p) => <PetAvatar x={(p.x as number) ?? 400} y={(p.y as number) ?? 200} size={(p.size as PetAvatarProps['size']) || 'normal'} expression={(p.expression as PetAvatarProps['expression']) || 'neutral'} id={p.id as string | undefined} />);
registerComponent('stat-bars', (p) => <StatBars hunger={(p.hunger as number) ?? 50} happiness={(p.happiness as number) ?? 50} energy={(p.energy as number) ?? 50} affection={(p.affection as number) ?? 50} />);
registerComponent('thought-bubble', (p) => <ThoughtBubble text={(p.text as string) || '...'} visible={(p.visible as boolean) ?? true} thinking={(p.thinking as boolean) ?? false} />);
registerComponent('action-palette', (p) => <ActionPalette actions={(p.actions as string[]) || []} onAction={p.onAction as ActionPaletteProps['onAction']} />);
registerComponent('inventory-slot', (p) => <InventorySlot items={(p.items as string[]) || []} />);

// Aether protocol adapters
registerComponent('pet-entity', (p) => <PetAvatar x={(p.x as number) ?? 400} y={(p.y as number) ?? 200} size={(p.size as PetAvatarProps['size']) || 'normal'} expression={(p.expression as PetAvatarProps['expression']) || 'neutral'} id={p.id as string | undefined} />);

const MOOD_ORB: Record<string, { gradient: string; glow: string; emoji: string; label: string }> = {
  happy: { gradient: 'linear-gradient(135deg,#fef08a,#fbbf24)', glow: '0 0 16px rgba(251,191,36,0.5)', emoji: '\u2726', label: 'Joyful' },
  sad: { gradient: 'linear-gradient(135deg,#bfdbfe,#93c5fd)', glow: '0 0 16px rgba(147,197,253,0.5)', emoji: '\u25C7', label: 'Melancholy' },
  sleepy: { gradient: 'linear-gradient(135deg,#ddd6fe,#c4b5fd)', glow: '0 0 16px rgba(196,181,253,0.5)', emoji: '\u263D', label: 'Dreamy' },
  excited: { gradient: 'linear-gradient(135deg,#fbcfe8,#f472b6)', glow: '0 0 16px rgba(244,114,182,0.5)', emoji: '\u2727', label: 'Thrilled' },
  hungry: { gradient: 'linear-gradient(135deg,#fed7aa,#fb923c)', glow: '0 0 16px rgba(251,146,60,0.5)', emoji: '\u25CB', label: 'Peckish' },
  neutral: { gradient: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', glow: '0 0 12px rgba(203,213,225,0.4)', emoji: '\u00B7', label: 'Calm' },
  grumpy: { gradient: 'linear-gradient(135deg,#d6d3d1,#a8a29e)', glow: '0 0 12px rgba(168,162,158,0.4)', emoji: '\u25B3', label: 'Restless' },
  dance: { gradient: 'linear-gradient(135deg,#fef08a,#f472b6,#c4b5fd)', glow: '0 0 20px rgba(255,100,255,0.5)', emoji: '\u274B', label: 'Grooving' },
};
function MoodOrb({ mood = 'neutral', size = 24 }: { mood?: string; size?: number }) {
  const c = MOOD_ORB[mood] || MOOD_ORB.neutral;
  return (<div style={{ position: 'absolute', right: 16, top: 16, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: size, height: size, borderRadius: '50%', background: c.gradient, boxShadow: c.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, color: '#fff', animation: 'aether-float 3s ease-in-out infinite' }}>{c.emoji}</div><span style={{ fontSize: 11, fontWeight: 500, color: '#6b7280' }}>{c.label}</span></div>);
}
registerComponent('mood-orb', (p) => <MoodOrb mood={(p.mood as string) || 'neutral'} size={(p.size as number) || 24} />);

function UnlockToast({ unlocks = [] }: { unlocks?: string[] }) {
  if (!unlocks.length) return null;
  return (<div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.95)', padding: '8px 16px', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', animation: 'aether-pop-in 0.4s ease-out both', fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>Unlocked: {unlocks.join(', ')}!</div>);
}
registerComponent('unlock-toast', (p) => <UnlockToast unlocks={(p.unlocks as string[]) || []} />);

// ============================================================================
// Tree Renderer
// ============================================================================

function renderTreeNode(node: TreeNode, dispatch?: (action: string) => void): React.ReactElement {
  const { component, children } = node;
  const factory = componentRegistry.get(component.type);
  const childEls = children.map((c) => renderTreeNode(c, dispatch));
  if (factory) {
    const props = { ...component.props, ...(childEls.length ? { children: childEls } : {}), ...(component.type === 'action-palette' && dispatch ? { onAction: dispatch } : {}) };
    return <React.Fragment key={component.id}>{factory(props)}</React.Fragment>;
  }
  return (<div key={component.id} style={{ padding: 8, margin: 4, border: '1px dashed #f59e0b', borderRadius: 6, background: '#fffbeb', fontSize: 11, color: '#92400e', fontFamily: 'monospace' }}><strong>[unknown: {component.type}]</strong><br />id: {component.id}{childEls.length > 0 && <div>{childEls}</div>}</div>);
}

// ============================================================================
// A2UIRenderer Component
// ============================================================================

interface A2UIRendererProps { store: SurfaceStore; onAction?: (action: string) => void; className?: string; }

export function A2UIRenderer({ store, onAction, className }: A2UIRendererProps) {
  const [snapshot, setSnapshot] = useState<SurfaceSnapshot | null>(store.getSnapshot());
  useEffect(() => {
    const interval = setInterval(() => {
      const next = store.getSnapshot();
      if (next && next.version !== snapshot?.version) setSnapshot(next);
    }, 50);
    return () => clearInterval(interval);
  }, [store, snapshot?.version]);
  const treeRoots = useMemo(() => snapshot ? resolveTree(snapshot.components) : [], [snapshot]);
  const handleAction = useCallback((action: string) => { onAction?.(action); }, [onAction]);
  if (!snapshot || !treeRoots.length) return <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8', fontSize: 14 }}>Waiting for A2UI surface...</div>;
  return <div className={className}>{treeRoots.map((root) => renderTreeNode(root, handleAction))}</div>;
}

export function useA2UIRenderer(store: SurfaceStore, onAction?: (action: string) => void) {
  const [snapshot, setSnapshot] = useState<SurfaceSnapshot | null>(store.getSnapshot());
  useEffect(() => {
    const interval = setInterval(() => {
      const next = store.getSnapshot();
      if (next && next.version !== snapshot?.version) setSnapshot(next);
    }, 50);
    return () => clearInterval(interval);
  }, [store, snapshot?.version]);
  const treeRoots = useMemo(() => snapshot ? resolveTree(snapshot.components) : [], [snapshot]);
  const rendered = useMemo(() => treeRoots.map((root) => renderTreeNode(root, onAction)), [treeRoots, onAction]);
  return { snapshot, treeRoots, rendered };
}

export { Scene, Background, PetAvatar, StatBars, ThoughtBubble, ActionPalette, InventorySlot, resolveTree, diffComponents };
export type { SurfaceSnapshot, TreeNode, StreamPhase, A2UIPayload };
