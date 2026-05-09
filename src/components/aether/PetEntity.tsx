import React, { useRef, useState, useEffect } from "react";

interface PetEntityProps {
  x?: number;
  y?: number;
  size?: "small" | "normal" | "big";
  expression?: "neutral" | "happy" | "sad" | "sleepy" | "excited" | "hungry" | "grumpy" | "dance";
  id?: string;
  className?: string;
}

const sizes: Record<string, { px: number; scale: number; fontSize: number }> = {
  small: { px: 48, scale: 0.75, fontSize: 10 },
  normal: { px: 64, scale: 1, fontSize: 12 },
  big: { px: 80, scale: 1.25, fontSize: 14 },
};

const palette: Record<string, { bg: string; glow: string }> = {
  neutral: {
    bg: "from-gray-300 to-gray-400",
    glow: "0 4px 20px rgba(156,163,175,0.35)",
  },
  happy: {
    bg: "from-yellow-300 to-amber-400",
    glow: "0 6px 28px rgba(251,191,36,0.5)",
  },
  sad: {
    bg: "from-blue-300 to-blue-400",
    glow: "0 6px 24px rgba(147,197,253,0.45)",
  },
  sleepy: {
    bg: "from-violet-300 to-purple-400",
    glow: "0 6px 24px rgba(196,181,253,0.45)",
  },
  excited: {
    bg: "from-pink-400 to-rose-500",
    glow: "0 8px 32px rgba(244,114,182,0.55)",
  },
  hungry: {
    bg: "from-orange-300 to-amber-500",
    glow: "0 6px 24px rgba(251,146,60,0.45)",
  },
  grumpy: {
    bg: "from-stone-400 to-stone-500",
    glow: "0 4px 20px rgba(120,113,108,0.35)",
  },
  dance: {
    bg: "from-yellow-300 via-pink-400 to-blue-400",
    glow: "0 8px 36px rgba(255,100,255,0.55)",
  },
};

const faces: Record<string, string> = {
  neutral: "(-_-)",
  happy: "(^o^)",
  sad: "(;_;)",
  sleepy: "(=^..^=)",
  excited: "(>ω<)!!",
  hungry: "(o_o)~",
  grumpy: "(>_<)",
  dance: "(≧▽≦)",
};

const springTransition = "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function PetEntity({
  x = 0,
  y = 0,
  size = "normal",
  expression = "neutral",
  id,
  className = "",
}: PetEntityProps) {
  const [mounted, setMounted] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const prevX = useRef(x);
  const prevY = useRef(y);
  const isMoving = x !== prevX.current || y !== prevY.current;

  useEffect(() => {
    prevX.current = x;
    prevY.current = y;
  }, [x, y]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    setBreathing(true);
    const timer = setTimeout(() => setBreathing(false), 700);
    return () => clearTimeout(timer);
  }, [expression]);

  const { px, scale, fontSize } = sizes[size];
  const { bg, glow } = palette[expression] || palette.neutral;
  const face = faces[expression] || faces.neutral;

  const animClass = expression === "dance"
    ? "animate-aether-dance"
    : "";

  const breathScale = breathing ? scale * 1.08 : scale;
  const moveBoost = isMoving ? "aether-move-ripple" : "";

  return (
    <div
      key={id || "pet-entity"}
      className={`absolute select-none ${animClass} ${moveBoost} ${className}`}
      style={{
        left: x - px / 2,
        top: y - px / 2,
        width: px,
        height: px,
        transition: springTransition,
        willChange: "left, top, transform",
      }}
    >
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${bg} flex items-center justify-center transition-all duration-700 ease-out`}
        style={{
          transform: `scale(${breathScale})`,
          boxShadow: glow,
          opacity: mounted ? 1 : 0,
          transition: springTransition,
        }}
      >
        <span
          className="text-white font-bold whitespace-nowrap"
          style={{
            fontSize,
            textShadow: "0 1px 3px rgba(0,0,0,0.25)",
            fontFamily: "'Noto Color Emoji', 'Segoe UI Emoji', monospace",
          }}
        >
          {face}
        </span>
      </div>

      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          transform: `scale(${scale * 1.35})`,
          background: `radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)`,
          transition: springTransition,
        }}
      />
    </div>
  );
}
