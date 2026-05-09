import React, { useMemo } from "react";

interface MoodOrbProps {
  mood?: "happy" | "sad" | "sleepy" | "excited" | "hungry" | "neutral" | "grumpy" | "dance";
  size?: number;
  className?: string;
}

const orbStyles: Record<string, { colors: string; ring: string; label: string; emoji: string }> = {
  happy: {
    colors: "from-yellow-200 to-amber-300",
    ring: "ring-yellow-300/40",
    label: "Joyful",
    emoji: "✦",
  },
  sad: {
    colors: "from-blue-200 to-indigo-300",
    ring: "ring-blue-300/40",
    label: "Melancholy",
    emoji: "◇",
  },
  sleepy: {
    colors: "from-violet-200 to-purple-300",
    ring: "ring-violet-300/40",
    label: "Dreamy",
    emoji: "☽",
  },
  excited: {
    colors: "from-pink-300 to-rose-400",
    ring: "ring-pink-300/40",
    label: "Thrilled",
    emoji: "✧",
  },
  hungry: {
    colors: "from-orange-200 to-amber-400",
    ring: "ring-orange-300/40",
    label: "Peckish",
    emoji: "○",
  },
  neutral: {
    colors: "from-slate-200 to-gray-300",
    ring: "ring-slate-300/40",
    label: "Calm",
    emoji: "·",
  },
  grumpy: {
    colors: "from-stone-300 to-stone-400",
    ring: "ring-stone-300/40",
    label: "Restless",
    emoji: "△",
  },
  dance: {
    colors: "from-yellow-200 via-pink-300 to-violet-300",
    ring: "ring-fuchsia-300/40",
    label: "Grooving",
    emoji: "❋",
  },
};

export default function MoodOrb({
  mood = "neutral",
  size = 40,
  className = "",
}: MoodOrbProps) {
  const style = useMemo(() => orbStyles[mood] || orbStyles.neutral, [mood]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Pulsing outer ring */}
        <div
          className={`absolute rounded-full ring-2 ${style.ring} animate-aether-pulse`}
          style={{
            inset: "-6px",
          }}
        />
        {/* Core orb */}
        <div
          className={`rounded-full bg-gradient-to-br ${style.colors} animate-aether-float`}
          style={{
            width: size,
            height: size,
            boxShadow: `0 0 20px rgba(255,255,255,0.3), inset 0 -2px 6px rgba(0,0,0,0.08)`,
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center text-white/80"
            style={{ fontSize: size * 0.4 }}
          >
            {style.emoji}
          </div>
        </div>
      </div>
      <span className="text-sm font-medium text-foreground/70 tracking-wide">
        {style.label}
      </span>
    </div>
  );
}
