import { useState, useEffect, useCallback, useRef } from 'react';
import { useAetherStream } from './hooks/useAetherStream';
import AetherScene from './components/aether/AetherScene';
import AetherBackground from './components/aether/AetherBackground';
import PetEntity from './components/aether/PetEntity';
import MoodOrb from './components/aether/MoodOrb';
import ThoughtStream from './components/aether/ThoughtStream';
import VitalHorizon from './components/aether/VitalHorizon';
import ActionSanctum from './components/aether/ActionSanctum';
import EvolutionInventory, { WisdomPortal } from './components/aether/EvolutionInventory';

/* ─── Types ─────────────────────────────────────────────────────── */
type Mood = 'neutral' | 'happy' | 'sad' | 'sleepy' | 'excited' | 'hungry' | 'grumpy' | 'dance';
type Location = 'room' | 'park' | 'bedroom' | 'void' | 'golden-room';

interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
  affection: number;
}

/* ─── Thought pools ─────────────────────────────────────────────── */
const THOUGHTS: Record<string, string[]> = {
  feed: ['Yummy! 🍎', 'That hit the spot~', 'More snacks please!', 'Tasty!'],
  play: ['So fun! 🎾', 'Catch me if you can!', 'Again again!', 'Wheee~'],
  sleep: ['Zzz...', 'So comfy~', 'Sweet dreams...', 'Goodnight...'],
  talk: ['Tell me more!', 'I love chatting!', 'Really? Wow!', 'Hmm, interesting...'],
  hug: ["*happy noises*", 'Warm hugs~', 'Love you too!', 'Squeeze!'],
  dance: ["Let's boogie! 💃", "Can't stop dancing!", 'Feel the rhythm~', 'Dance party!'],
  explore: ["What's over here?", 'New place!', 'So much to discover~', 'Adventure!'],
  train: ['Getting stronger! 💪', 'I can do it!', 'One more rep!', 'Level up!'],
};

const WISDOM = [
  'Play is the highest form of learning.',
  'Every journey begins with a single spark.',
  'Love multiplies when shared.',
  'Clarity comes from patience.',
  'Even the ocean listens to the shore.',
  'Bloom where you are planted.',
  'Transformation takes time.',
  'Wisdom is the reward of curiosity.',
];

/* ─── Mood derivation (mirrors the server engine) ───────────────── */
function deriveMood(stats: PetStats): Mood {
  if (stats.energy < 20) return 'sleepy';
  if (stats.hunger < 25) return 'hungry';
  if (stats.happiness > 80 && stats.energy > 50) return 'dance';
  if (stats.happiness > 65) return 'happy';
  if (stats.happiness < 25) return 'sad';
  if (stats.affection > 70) return 'excited';
  return 'neutral';
}

/* ─── Main App ──────────────────────────────────────────────────── */
export default function App() {
  const { sessionId, payload, isStreaming, phase, sendAction, error } = useAetherStream();

  /* local pet state (mirrors server state for instant UI feedback) */
  const [stats, setStats] = useState<PetStats>({
    hunger: 60, happiness: 60, energy: 70, affection: 30,
  });
  const [location, setLocation] = useState<Location>('room');
  const [position, setPosition] = useState({ x: 400, y: 200 });
  const [thought, setThought] = useState('Hello! ✨');
  const [thoughtVisible, setThoughtVisible] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [inventory, setInventory] = useState<string[]>(['star', 'heart']);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(35);
  const [insights, setInsights] = useState<string[]>(['Your pet enjoys quiet moments.']);

  /* ── Sync state from server payload ───────────────────────────── */
  useEffect(() => {
    if (!payload || !payload.dataModelUpdate?.stats) return;
    const s = payload.dataModelUpdate.stats;
    setStats({ hunger: s.hunger, happiness: s.happiness, energy: s.energy, affection: s.affection });
  }, [payload]);

  /* ── Natural stat decay (runs every second on client) ─────────── */
  const lastDecayRef = useRef(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastDecayRef.current < 3000) return;
      lastDecayRef.current = now;
      setStats((prev) => ({
        hunger: Math.max(0, prev.hunger - 0.8),
        happiness: Math.max(0, prev.happiness - 0.5),
        energy: Math.max(0, prev.energy - 0.3),
        affection: Math.max(0, prev.affection - 0.2),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ── Gentle idle movement ─────────────────────────────────────── */
  const animFrameRef = useRef<number>(0);
  useEffect(() => {
    const move = () => {
      setPosition((prev) => ({
        x: Math.max(60, Math.min(640, prev.x + (Math.random() - 0.5) * 3)),
        y: Math.max(80, Math.min(340, prev.y + (Math.random() - 0.5) * 2)),
      }));
      animFrameRef.current = requestAnimationFrame(() => {
        setTimeout(move, 2000 + Math.random() * 3000);
      });
    };
    const id = setTimeout(move, 3000);
    return () => { clearTimeout(id); cancelAnimationFrame(animFrameRef.current); };
  }, []);

  /* ── Random idle thoughts ─────────────────────────────────────── */
  useEffect(() => {
    const idleThoughts = ['...', 'What should we do?', 'Feeling good~', '*stretches*', 'Hmm~', '✨', 'Anything fun today?'];
    const interval = setInterval(() => {
      if (isThinking) return;
      setThought(idleThoughts[Math.floor(Math.random() * idleThoughts.length)]);
      setThoughtVisible(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [isThinking]);

  /* ── Location cycling based on mood ───────────────────────────── */
  const mood = deriveMood(stats);
  useEffect(() => {
    if (mood === 'sleepy') setLocation('bedroom');
    else if (mood === 'happy' || mood === 'dance') setLocation('park');
    else if (mood === 'sad') setLocation('void');
    else setLocation('room');
  }, [mood]);

  /* ── Action handler: sends to server + updates local state ───── */
  const handleAction = useCallback((action: string) => {
    sendAction(action);
    setIsThinking(true);
    setThoughtVisible(false);

    setTimeout(() => {
      const thoughts = THOUGHTS[action] || ['Nice!'];
      const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
      setThought(thought);
      setThoughtVisible(true);
      setIsThinking(false);

      setStats((prev) => {
        const next = { ...prev };
        switch (action) {
          case 'feed':
            next.hunger = Math.min(100, prev.hunger + 20);
            next.happiness = Math.min(100, prev.happiness + 5);
            break;
          case 'play':
            next.happiness = Math.min(100, prev.happiness + 15);
            next.energy = Math.max(0, prev.energy - 10);
            next.hunger = Math.max(0, prev.hunger - 5);
            break;
          case 'sleep':
            next.energy = Math.min(100, prev.energy + 25);
            next.hunger = Math.max(0, prev.hunger - 5);
            break;
          case 'talk':
            next.affection = Math.min(100, prev.affection + 10);
            next.happiness = Math.min(100, prev.happiness + 5);
            break;
          case 'hug':
            next.affection = Math.min(100, prev.affection + 15);
            next.happiness = Math.min(100, prev.happiness + 10);
            break;
          case 'dance':
            next.happiness = Math.min(100, prev.happiness + 20);
            next.energy = Math.max(0, prev.energy - 8);
            break;
          case 'explore':
            next.happiness = Math.min(100, prev.happiness + 10);
            next.energy = Math.max(0, prev.energy - 12);
            break;
          case 'train':
            next.energy = Math.max(0, prev.energy - 15);
            next.happiness = Math.min(100, prev.happiness + 8);
            break;
        }
        return next;
      });

      setExperience((prev) => {
        const next = prev + 10 + Math.floor(Math.random() * 5);
        const xpNeeded = level * 100;
        if (next >= xpNeeded) {
          setLevel((l) => l + 1);
          const rewards = ['crystal', 'feather', 'potion', 'book', 'key'];
          const reward = rewards[Math.floor(Math.random() * rewards.length)];
          setInventory((inv) => [...inv, reward]);
          setInsights((prev) => [WISDOM[Math.floor(Math.random() * WISDOM.length)], ...prev.slice(0, 3)]);
          return next - xpNeeded;
        }
        return next;
      });
    }, 600);
  }, [sendAction, level]);

  /* ── Render the full cinematic scene ─────────────────────────── */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #dbeafe 100%)',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 8px' }}>
        <h1 style={{
          fontSize: 36, fontWeight: 700, margin: 0,
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>AetherPet</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>Agent-driven virtual pet — every pixel generated</p>
        {sessionId && (
          <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 6 }}>
            Session: {sessionId.slice(0, 8)}… | Phase: {phase} | {isStreaming ? '⏳ processing' : '✨ idle'}
          </p>
        )}
        {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{error}</p>}
      </div>

      {/* Main scene container */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 24px 24px' }}>
        <AetherScene height={420} className="shadow-2xl shadow-violet-200/40 border border-white/60">
          {/* Background */}
          <AetherBackground variant={location} moodTint={mood} />

          {/* Mood Orb (top-left) */}
          <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
            <MoodOrb mood={mood} size={36} />
          </div>

          {/* Thought Stream (above pet) */}
          <ThoughtStream
            text={thought}
            visible={thoughtVisible}
            thinking={isThinking}
            offsetX={position.x + 50}
            offsetY={position.y - 60}
          />

          {/* Pet Entity */}
          <PetEntity
            x={position.x}
            y={position.y}
            size="big"
            expression={mood}
            id="aether-pet"
          />

          {/* Vital Horizon (bottom bar) */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 10, padding: '4px 8px' }}>
            <div style={{
              padding: '10px 12px', borderRadius: 12,
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255,255,255,0.6)',
            }}>
              <VitalHorizon hunger={stats.hunger} happiness={stats.happiness} energy={stats.energy} affection={stats.affection} compact />
            </div>
          </div>
        </AetherScene>

        {/* Action buttons */}
        <div style={{ marginTop: 16 }}>
          <ActionSanctum
            onAction={handleAction}
            columns={5}
            actions={['feed', 'play', 'sleep', 'talk', 'hug', 'dance', 'explore', 'train']}
          />
        </div>

        {/* Inventory + Wisdom */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <div style={{
            padding: 16, borderRadius: 16,
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <EvolutionInventory items={inventory} />
          </div>
          <div style={{
            padding: 16, borderRadius: 16,
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <WisdomPortal insights={insights} level={level} experience={experience} />
          </div>
        </div>
      </div>
    </div>
  );
}
