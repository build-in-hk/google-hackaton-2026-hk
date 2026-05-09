import type { A2UIPayload } from './types';
import React from 'react';

// Custom component registry
type ComponentRenderer = (props: Record<string, unknown>) => JSX.Element;

const CUSTOM_COMPONENTS: Record<string, ComponentRenderer> = {
  scene: (props) => <Scene width={props.width as number} height={props.height as number} />,
  background: (props) => <Background variant={props.variant as string} moodTint={props.moodTint as string} />,
  petAvatar: (props) => <PetAvatar x={props.x as number} y={props.y as number} size={props.size as 'small'|'normal'|'big'} expression={props.expression as string} />,
  statBars: (props) => <StatBars hunger={props.hunger as number} happiness={props.happiness as number} energy={props.energy as number} affection={props.affection as number} />,
  thoughtBubble: (props) => <ThoughtBubble text={props.text as string} visible={props.visible as boolean} thinking={props.thinking as boolean} />,
  actionPalette: (props) => <ActionPalette actions={props.actions as string[]} />,
  inventorySlot: (props) => { const items = (props.items || []) as Array<string>; return <InventorySlot items={items} />; },
};

export function renderComponent(componentId: string, props: unknown) {
  const renderer = CUSTOM_COMPONENTS[componentId];
  if (renderer) return renderer(props as Record<string, unknown>);
  return React.createElement('div', null, JSON.stringify(props));
}

// Scene viewport
function Scene({ width = 800, height = 400 }: { width?: number; height?: number }) {
  const [children, setChildren] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
    const unsubscribe = (window as any).__sceneChildren?.subscribe((c: React.ReactNode[]) => {
      setChildren(c);
    });
    return unsubscribe;
  }, []);

  return React.createElement('div', {
    style: { position: 'relative', width: '100%', height, overflow: 'hidden', borderRadius: 12, background: '#f8f9fa' },
  }, children);
}

// Background with gradient
function Background({ variant = 'room', moodTint }: { variant?: string; moodTint?: string }) {
  const gradients: Record<string, string> = {
    room: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    park: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)',
    bedroom: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
    void: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    'golden-room': 'linear-gradient(135deg, #fef9c3 0%, #facc15 100%)',
  };

  const moodTints: Record<string, string> = {
    happy: 'rgba(255, 255, 0, 0.1)', sad: 'rgba(100, 100, 255, 0.1)',
    sleepy: 'rgba(150, 150, 255, 0.2)', excited: 'rgba(255, 100, 200, 0.1)',
    hungry: 'rgba(255, 200, 0, 0.15)', grumpy: 'rgba(150, 100, 50, 0.1)',
    dance: 'rgba(255, 100, 255, 0.15)',
  };

  return React.createElement('div', {
    style: {
      position: 'absolute', inset: 0,
      background: gradients[variant] || gradients.room,
      transition: 'background 0.8s ease-in-out',
      ...(moodTint && moodTints[moodTint]
        ? { boxShadow: `inset 0 0 60px ${moodTints[moodTint]}` }
        : {}),
    },
  });
}

// Animated pet avatar
function PetAvatar({ x = 400, y = 200, size = 'normal', expression = 'neutral', id }: {
  x: number; y: number;
  size: 'small' | 'normal' | 'big';
  expression: string;
  id?: string;
}) {
  const sizes = { small: 48, normal: 64, big: 80 };
  const colors: Record<string, string> = {
    neutral: '#9ca3af', happy: '#fbbf24', sad: '#93c5fd',
    sleepy: '#c4b5fd', excited: '#f472b6', hungry: '#fb923c',
    grumpy: '#9ca3af', dance: 'linear-gradient(135deg, #fbbf24, #f472b6, #93c5fd)',
  };

  const glows: Record<string, string> = {
    neutral: '0 4px 12px rgba(0,0,0,0.1)', happy: '0 4px 20px rgba(251,191,36,0.4)',
    sad: '0 4px 20px rgba(147,197,253,0.4)', sleepy: '0 4px 20px rgba(196,181,253,0.4)',
    excited: '0 4px 24px rgba(244,114,182,0.5)', hungry: '0 4px 20px rgba(251,146,60,0.4)',
    grumpy: '0 4px 20px rgba(156,163,175,0.4)', dance: '0 4px 28px rgba(255,100,255,0.5)',
  };

  const scales = { small: 0.75, normal: 1, big: 1.25 };

  return React.createElement('div', {
    key: id || 'pet',
    style: {
      position: 'absolute', left: x, top: y,
      width: sizes[size], height: sizes[size], borderRadius: '50%',
      background: colors[expression] || colors.neutral,
      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: `scale(${scales[size]})`, boxShadow: glows[expression],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size === 'big' ? 14 : size === 'small' ? 10 : 12,
      fontFamily: 'monospace', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    },
  }, getPetFace(expression));
}

// Stat bars
function StatBars({ hunger = 50, happiness = 50, energy = 50, affection = 50 }) {
  const stats = [
    { label: '🍎 Hunger', value: hunger, color: '#fbbf24' },
    { label: '💛 Happiness', value: happiness, color: '#34d399' },
    { label: '⚡ Energy', value: energy, color: '#60a5fa' },
    { label: '❤️ Affection', value: affection, color: '#f472b6' },
  ];

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
    stats.map((stat) => React.createElement('div', { key: stat.label, style: { padding: '4px 0' } },
      React.createElement('div', { style: { fontSize: 11, textTransform: 'capitalize', color: '#6b7280', marginBottom: 2 } }, `${stat.label}: ${stat.value.toFixed(0)}%`),
      React.createElement('div', { style: { height: 10, background: '#e5e7eb', borderRadius: 5, overflow: 'hidden' } },
        React.createElement('div', {
          style: { width: `${Math.min(100, Math.max(0, stat.value))}%`, height: '100%', background: stat.color, borderRadius: 5, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' },
        })
      )
    ))
  );
}

// Thought bubble
function ThoughtBubble({ text = '...', visible = true, thinking = false }) {
  return React.createElement('div', {
    style: {
      position: 'absolute', left: 520, top: 160, background: '#fff',
      padding: '8px 14px', borderRadius: 16, fontSize: 13,
      fontFamily: "'Segoe UI', sans-serif", color: '#374151',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      animation: visible ? 'fadeInUp 0.4s ease' : 'fadeOut 0.3s ease',
      pointerEvents: 'none', maxWidth: 180,
    },
  }, thinking ? React.createElement('span', { style: { display: 'inline-block', animation: 'pulse 1s infinite' } }, '...') : text);
}

// Action palette
function ActionPalette({ actions = ['feed', 'play', 'sleep', 'talk'] }) {
  const icons: Record<string, string> = { feed: '🍎', play: '🎾', sleep: '🌙', talk: '💬', hug: '🤗' };

  return React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 } },
    actions.map((action) => React.createElement('button', {
      key: action, onClick: () => (window as any).__onAction?.(action),
      style: {
        padding: '10px 16px', border: 'none', borderRadius: 8, background: '#f9fafb',
        cursor: 'pointer', fontSize: 14, fontFamily: "'Segoe UI', sans-serif",
        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 6,
        justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
    }, React.createElement('span', null, icons[action] || '✨'), React.createElement('span', { style: { textTransform: 'capitalize', fontWeight: 500 } }, action)))
  );
}

// Inventory slot
function InventorySlot({ items }: { items: string[] }) {
  const emojis: Record<string, string> = { 'toy-ball': '🎾', crown: '👑', star: '⭐', heart: '❤️', cookie: '🍪' };

  return React.createElement('div', { style: { display: 'flex', gap: 8, padding: 10, background: 'rgba(255,255,255,0.7)', borderRadius: 8 } },
    items.length === 0
      ? React.createElement('span', { style: { color: '#9ca3af', fontSize: 12 } }, 'No items yet')
      : items.map((item) => React.createElement('div', {
          key: item, style: { width: 36, height: 36, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', animation: 'popIn 0.3s ease' },
        }, emojis[item] || '✨'))
  );
}

function getPetFace(expression: string): string {
  const faces: Record<string, string> = {
    neutral: '(-_-)', happy: '(^o^)', sad: '(;_;)',
    sleepy: '(=^..^=)', excited: '(>ω<)!!', hungry: '(o_o)~',
    grumpy: '(>_<)', dance: '(≧▽≦)',
  };
  return faces[expression] || '(-_-)';
}
