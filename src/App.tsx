import { useState, useEffect } from 'react';
import type { A2UIComponent } from './a2ui/types';
import { useA2UIStream } from './hooks/useAetherStream';

export default function App() {
  const sessionId = useState(() => {
    const saved = localStorage.getItem('tamagotchi-session');
    if (saved) return saved;
    const id = crypto.randomUUID();
    localStorage.setItem('tamagotchi-session', id);
    return id;
  })[0];

  const [petState, setPetState] = useState({
    hunger: 60, happiness: 60, energy: 70, affection: 30,
    mood: 'neutral' as const, location: 'room' as const,
    position: { x: 400, y: 200 }, unlockedComponents: ['hug-button'], inventory: [],
  });

  const [thought, setThought] = useState('...');
  const { payload, sendAction, isStreaming } = useA2UIStream({ sessionId });

  useEffect(() => {
    if (!payload) return;

    const stats = payload.dataModelUpdate?.stats;
    if (stats) {
      setPetState(prev => ({
        ...prev,
        hunger: stats.hunger,
        happiness: stats.happiness,
        energy: stats.energy,
        affection: stats.affection,
      }));
    }

    if (payload.surfaceUpdate?.components) {
      const bubbleComp = payload.surfaceUpdate.components.find(
        (c) => c.id === 'thought-bubble'
      );
      if (bubbleComp) {
        const bubble = bubbleComp.component['thought-bubble'] as any;
        if (bubble?.text) setThought(bubble.text);
      }
    }
  }, [payload]);

  const handleAction = (action: string) => {
    sendAction(action);
  };

  const components = payload?.surfaceUpdate?.components || [];
  const bgComponent = components.find((c) => c.component.background);
  const petComponent = components.find((c) => c.component['pet-avatar']);
  const bubbleComponent = components.find((c) => c.id === 'thought-bubble');

  return (
    <div style={{
      maxWidth: 900, margin: '0 auto', padding: 24,
      fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: '100vh', background: '#f8fafc',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1e293b', margin: 0 }}>🐾 A2UI Tamagotchi</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Your agent-driven virtual pet — every pixel is generated!</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        {bgComponent && (
          <div style={{
            position: 'absolute', inset: 0,
            background: (bgComponent.component.background as any).variant === 'room' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' :
              (bgComponent.component.background as any).variant === 'park' ? 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)' :
                (bgComponent.component.background as any).variant === 'bedroom' ? 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)' :
                  (bgComponent.component.background as any).variant === 'void' ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' :
                    'linear-gradient(135deg, #fef9c3 0%, #facc15 100%)',
            transition: 'background 0.8s ease-in-out', borderRadius: 12,
          }} />
        )}

        <div style={{ position: 'relative', width: '100%', height: 360, overflow: 'hidden', borderRadius: 12 }}>
          {petComponent && (
            <div style={{
              position: 'absolute',
              left: (petComponent.component['pet-avatar'] as any).x || 400,
              top: (petComponent.component['pet-avatar'] as any).y || 200,
              width: (petComponent.component['pet-avatar'] as any).size === 'big' ? 80 :
                (petComponent.component['pet-avatar'] as any).size === 'small' ? 48 : 64,
              height: (petComponent.component['pet-avatar'] as any).size === 'big' ? 80 :
                (petComponent.component['pet-avatar'] as any).size === 'small' ? 48 : 64,
              borderRadius: '50%',
              background: getPetColor((petComponent.component['pet-avatar'] as any).expression),
              transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontFamily: 'monospace', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              boxShadow: getPetGlow((petComponent.component['pet-avatar'] as any).expression),
            }}>
              {getPetFace((petComponent.component['pet-avatar'] as any).expression)}
            </div>
          )}

          {bubbleComponent && (bubbleComponent.component['thought-bubble'] as any).visible !== false && (
            <div style={{
              position: 'absolute', left: 520, top: 140, background: '#fff', padding: '10px 16px',
              borderRadius: 20, fontSize: 13, fontFamily: "'Segoe UI', sans-serif", color: '#374151',
              boxShadow: '0 2px 12px rgba(0,0,0,0.12)', animation: 'fadeInUp 0.4s ease', maxWidth: 220,
            }}>
              {(bubbleComponent.component['thought-bubble'] as any).thinking ? (
                <span style={{ display: 'inline-block', animation: 'pulse 1s infinite' }}>. . .</span>
              ) : (bubbleComponent.component['thought-bubble'] as any).text}
            </div>
          )}
        </div>

        <div style={{ marginTop: -20, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '16px 20px', background: '#f8fafc', borderRadius: 12 }}>
            <StatItem label="Hunger" value={petState.hunger} color="#fbbf24" icon="🍎" />
            <StatItem label="Happiness" value={petState.happiness} color="#34d399" icon="💛" />
            <StatItem label="Energy" value={petState.energy} color="#60a5fa" icon="⚡" />
            <StatItem label="Affection" value={petState.affection} color="#f472b6" icon="❤️" />
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 12, color: '#64748b', fontStyle: 'italic' }}>"{thought}"</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Actions</h3>
        <ActionButtons onAction={handleAction} isStreaming={isStreaming} unlockedComponents={petState.unlockedComponents} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Inventory</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {petState.inventory.length === 0 ? (
            <span style={{ color: '#9ca3af', fontSize: 14 }}>No items yet. Keep interacting to earn items!</span>
          ) : petState.inventory.map((item) => (<ItemChip key={item} item={item} />))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatBar label="Hunger" value={petState.hunger} color="#fbbf24" />
        <StatBar label="Happiness" value={petState.happiness} color="#34d399" />
        <StatBar label="Energy" value={petState.energy} color="#60a5fa" />
        <StatBar label="Affection" value={petState.affection} color="#f472b6" />
      </div>

      <div style={{ marginTop: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
        Session: {sessionId.slice(0, 8)}... | Total interactions: {petState.hunger + petState.happiness + petState.energy + petState.affection}
      </div>
    </div>
  );
}

function StatItem({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, transition: 'color 0.3s' }}>{value.toFixed(0)}%</div>
    </div>
  );
}

function ActionButtons({ onAction, isStreaming, unlockedComponents }: {
  onAction: (action: string) => void;
  isStreaming: boolean;
  unlockedComponents: string[];
}) {
  const actions = [
    { name: 'feed', icon: '🍎' }, { name: 'play', icon: '🎾' },
    { name: 'sleep', icon: '🌙' }, { name: 'talk', icon: '💬' },
    ...(unlockedComponents.includes('hug-button') ? [{ name: 'hug', icon: '🤗' }] : []),
  ];

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {actions.map((action) => (
        <button key={action.name} onClick={() => onAction(action.name)} disabled={isStreaming}
          style={{
            padding: '12px 20px', border: 'none', borderRadius: 10, background: '#f9fafb',
            cursor: isStreaming ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500,
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8,
            opacity: isStreaming ? 0.6 : 1,
          }}
          onMouseEnter={(e) => { if (!isStreaming) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <span style={{ fontSize: 18 }}>{action.icon}</span>
          <span>{action.name.charAt(0).toUpperCase() + action.name.slice(1)}</span>
        </button>
      ))}
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#64748b' }}>
        <span>{label}</span><span style={{ fontWeight: 600 }}>{value.toFixed(0)}%</span>
      </div>
      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </div>
    </div>
  );
}

function ItemChip({ item }: { item: string }) {
  const emojiMap: Record<string, string> = { 'toy-ball': '🎾', crown: '👑', star: '⭐', heart: '❤️', cookie: '🍪' };
  return (
    <span style={{ padding: '4px 12px', background: '#f9fafb', borderRadius: 16, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, animation: 'popIn 0.3s ease' }}>
      {emojiMap[item] || '✨'}<span style={{ textTransform: 'capitalize' }}>{item.replace('-', ' ')}</span>
    </span>
  );
}

function getPetColor(expression: string): string {
  const colors: Record<string, string> = { neutral: '#9ca3af', happy: '#fbbf24', sad: '#93c5fd', sleepy: '#c4b5fd', excited: '#f472b6', hungry: '#fb923c', grumpy: '#9ca3af', dance: 'linear-gradient(135deg, #fbbf24, #f472b6, #93c5fd)' };
  return colors[expression] || colors.neutral;
}

function getPetGlow(expression: string): string {
  const glows: Record<string, string> = { neutral: '0 4px 12px rgba(0,0,0,0.1)', happy: '0 4px 20px rgba(251,191,36,0.4)', sad: '0 4px 20px rgba(147,197,253,0.4)', sleepy: '0 4px 20px rgba(196,181,253,0.4)', excited: '0 4px 24px rgba(244,114,182,0.5)', hungry: '0 4px 20px rgba(251,146,60,0.4)' };
  return glows[expression] || glows.neutral;
}

function getPetFace(expression: string): string {
  const faces: Record<string, string> = { neutral: '(-_-)', happy: '(^o^)', sad: '(;_;)', sleepy: '(=^..^=)', excited: '(>ω<)!!', hungry: '(o_o)~', grumpy: '(>_<)', dance: '(≧▽≦)' };
  return faces[expression] || '(-_-)';
}
