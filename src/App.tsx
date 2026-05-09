import { useState, useEffect } from 'react';
import type { A2UIComponent } from './a2ui/types';
import { useA2UIStream } from './hooks/useAetherStream';
import type { AetherPetState } from './game-engine';

export default function App() {
  const sessionId = useState(() => {
    const saved = localStorage.getItem('tamagotchi-session');
    if (saved) return saved;
    const id = crypto.randomUUID();
    localStorage.setItem('tamagotchi-session', id);
    return id;
  })[0];

  const [petState, setPetState] = useState<AetherPetState>({
    hunger: 60, energy: 65, joy: 55, bond: 20,
    mood: 'neutral', location: 'room', stage: 'egg',
    position: { x: 400, y: 200 },
    unlocked: ['hug'], interactionCount: 0,
    history: [], createdAt: Date.now(), lastActionAt: Date.now(),
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
        energy: stats.energy,
        joy: stats.happiness,
        bond: stats.affection,
      }));
    }

    if (payload.surfaceUpdate?.components) {
      const bubbleComp = payload.surfaceUpdate.components.find(
        (c) => c.id === 'thought-bubble'
      );
      if (bubbleComp) {
        const bubble = (bubbleComp.component as any)['thought-bubble'];
        if (bubble?.text) setThought(bubble.text);
      }

      // Update background variant from components
      const bgComp = payload.surfaceUpdate.components.find((c) => c.component.background);
      if (bgComp) {
        const bg = (bgComp.component as any).background;
        if (bg?.variant) setPetState(prev => ({ ...prev, location: bg.variant as any }));
      }

      // Update pet position
      const petComp = payload.surfaceUpdate.components.find((c) => c.id === 'pet-entity');
      if (petComp) {
        const pet = (petComp.component as any)['pet-entity'];
        if (pet?.x !== undefined) {
          setPetState(prev => ({ ...prev, position: { x: pet.x, y: pet.y } }));
        }
      }

      // Update stage from data model
      const dm = payload.dataModelUpdate?.data;
      if (dm?.stage) {
        setPetState(prev => ({ ...prev, stage: dm.stage as any }));
      }
    }
  }, [payload]);

  const handleAction = (action: string) => sendAction(action);

  const components = payload?.surfaceUpdate?.components || [];
  const petComp = components.find((c) => c.id === 'pet-entity');
  const bgComp = components.find((c) => c.component.background);

  // Derived display values
  const moodColors: Record<string, string> = {
    euphoric: '#fbbf24', joyful: '#34d399', content: '#60a5fa',
    neutral: '#9ca3af', lonely: '#93c5fd', hungry: '#fb923c',
    tired: '#c4b5fd', anxious: '#f472b6', focused: '#60a5fa', affectionate: '#f472b6',
  };

  const stageEmojis: Record<string, string> = { egg: '🥚', baby: '🐣', youth: '🌱', adult: '🌳', elder: '🏛️' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1e293b', margin: 0 }}>🐾 A2UI Tamagotchi</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Your agent-driven virtual pet — every pixel is generated!</p>
      </div>

      {/* Stage indicator */}
      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 18 }}>
        {stageEmojis[petState.stage] || '🐾'} <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{petState.stage}</span>
      </div>

      {/* Scene */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 24, position: 'relative' }}>
        {/* Background */}
        {bgComp && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 12,
            background: `linear-gradient(to bottom right, ${getGradient(bgComp.component.background as any) || '#fef3c7, #fde68a'})`,
            transition: 'background 0.8s ease-in-out',
          }} />
        )}

        <div style={{ position: 'relative', width: '100%', height: 360, overflow: 'hidden', borderRadius: 12 }}>
          {petComp && (
            <div style={{
              position: 'absolute',
              left: ((petComp.component as any)['pet-entity'] as any).x || petState.position.x,
              top: ((petComp.component as any)['pet-entity'] as any).y || petState.position.y,
              width: petState.stage === 'egg' ? 48 : petState.stage === 'elder' ? 80 : 64,
              height: petState.stage === 'egg' ? 48 : petState.stage === 'elder' ? 80 : 64,
              borderRadius: '50%',
              background: moodColors[petState.mood] || '#9ca3af',
              transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: petState.stage === 'elder' ? 14 : 12,
              fontFamily: 'monospace', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              boxShadow: getGlow(petState.mood),
            }}>
              {getFace(petState.mood)}
            </div>
          )}

          {/* Thought bubble */}
          {payload && (components.find((c) => c.id === 'thought-bubble')?.component as any)['thought-bubble']?.visible !== false && (
            <div style={{ position: 'absolute', left: 520, top: 140, background: '#fff', padding: '10px 16px', borderRadius: 20, fontSize: 13, fontFamily: "'Segoe UI', sans-serif", color: '#374151', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', animation: 'fadeInUp 0.4s ease', maxWidth: 220 }}>
              {((components.find((c) => c.id === 'thought-bubble')?.component as any)['thought-bubble'] as any).thinking
                ? <span style={{ display: 'inline-block', animation: 'pulse 1s infinite' }}>. . .</span>
                : thought}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ marginTop: -20, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '16px 20px', background: '#f8fafc', borderRadius: 12 }}>
            <StatItem label="Hunger" value={petState.hunger} color="#fbbf24" icon="🍎" />
            <StatItem label="Joy" value={petState.joy} color="#34d399" icon="💛" />
            <StatItem label="Energy" value={petState.energy} color="#60a5fa" icon="⚡" />
            <StatItem label="Bond" value={petState.bond} color="#f472b6" icon="❤️" />
          </div>
        </div>

        {/* Thought text */}
        <p style={{ textAlign: 'center', marginTop: 12, color: '#64748b', fontStyle: 'italic' }}>"{thought}"</p>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Actions</h3>
        <ActionButtons onAction={handleAction} isStreaming={isStreaming} />
      </div>

      {/* Inventory */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Unlocks & Inventory</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {petState.unlocked.length === 0 ? (
            <span style={{ color: '#9ca3af', fontSize: 14 }}>Keep interacting to unlock features!</span>
          ) : petState.unlocked.map((item) => <ItemChip key={item} item={item} />)}
        </div>
      </div>

      {/* Detailed bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatBar label="Hunger" value={petState.hunger} color="#fbbf24" />
        <StatBar label="Joy" value={petState.joy} color="#34d399" />
        <StatBar label="Energy" value={petState.energy} color="#60a5fa" />
        <StatBar label="Bond" value={petState.bond} color="#f472b6" />
      </div>

      {/* Session info */}
      <div style={{ marginTop: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
        Session: {sessionId.slice(0, 8)}... | Interactions: {petState.interactionCount} | Mood: {petState.mood}
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

function ActionButtons({ onAction, isStreaming }: {
  onAction: (action: string) => void;
  isStreaming: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {[
        { name: 'feed', icon: '🍎' }, { name: 'play', icon: '🎾' },
        { name: 'talk', icon: '💬' }, { name: 'rest', icon: '🌙' },
        { name: 'share-feeling', icon: '💕' },
      ].map((a) => (
        <button key={a.name} onClick={() => onAction(a.name)} disabled={isStreaming}
          style={{ padding: '12px 20px', border: 'none', borderRadius: 10, background: '#f9fafb', cursor: isStreaming ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8, opacity: isStreaming ? 0.6 : 1 }}
          onMouseEnter={(e) => { if (!isStreaming) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
          <span style={{ fontSize: 18 }}>{a.icon}</span>
          <span>{a.name === 'share-feeling' ? 'Share Feeling' : a.name.charAt(0).toUpperCase() + a.name.slice(1)}</span>
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
  const emojiMap: Record<string, string> = { 'toy-ball': '🎾', crown: '👑', star: '⭐', heart: '❤️', cookie: '🍪', hug: '🤗', 'focus-timer': '⏱️', journal: '📖', 'photo-booth': '📸', 'garden-pass': '🌻', 'sky-dance': '💃', sanctuary: '🏛️' };
  return (
    <span style={{ padding: '4px 12px', background: '#f9fafb', borderRadius: 16, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, animation: 'popIn 0.3s ease' }}>
      {emojiMap[item] || '✨'}<span style={{ textTransform: 'capitalize' }}>{item.replace('-', ' ')}</span>
    </span>
  );
}

function getGradient(bg: any): string {
  const map: Record<string, string> = {
    room: '#fef3c7, #fde68a', park: '#dcfce7, #86efac', bedroom: '#dbeafe, #93c5fd',
    void: '#1e1b4b, #312e81', 'golden-room': '#fef9c3, #facc15',
  };
  return map[bg?.variant] || map.room;
}

function getGlow(mood: string): string {
  const g: Record<string, string> = {
    euphoric: '0 4px 20px rgba(251,191,36,0.4)', joyful: '0 4px 20px rgba(52,211,153,0.4)', content: '0 4px 20px rgba(96,165,250,0.4)',
    neutral: '0 4px 12px rgba(0,0,0,0.1)', lonely: '0 4px 20px rgba(147,197,253,0.4)', hungry: '0 4px 20px rgba(251,146,60,0.4)',
    tired: '0 4px 20px rgba(196,181,253,0.4)', anxious: '0 4px 24px rgba(244,114,182,0.5)', focused: '0 4px 20px rgba(96,165,250,0.4)',
    affectionate: '0 4px 28px rgba(244,114,182,0.5)',
  };
  return g[mood] || g.neutral;
}

function getFace(mood: string): string {
  const f: Record<string, string> = {
    euphoric: '(>ω<)!!', joyful: '(^o^)', content: '(-_-)', neutral: '(-_-)', lonely: '(;_;)', hungry: '(o_o)~',
    tired: '(=^..^=)', anxious: '(>_<)', focused: '(-_-)', affectionate: '(≧▽≦)',
  };
  return f[mood] || '(-_-)';
}
