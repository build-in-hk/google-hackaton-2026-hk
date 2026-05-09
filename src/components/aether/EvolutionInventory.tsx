import React, { useState } from "react";

interface EvolutionInventoryProps {
  items?: string[];
  className?: string;
}

interface WisdomPortalProps {
  insights?: string[];
  level?: number;
  experience?: number;
  className?: string;
}

const itemEmojis: Record<string, string> = {
  "toy-ball": "🎾",
  crown: "👑",
  star: "⭐",
  heart: "❤️",
  cookie: "🍪",
  crystal: "💎",
  feather: "🪶",
  potion: "🧪",
  book: "📖",
  key: "🔑",
  shell: "🐚",
  flower: "🌸",
};

const wisdomPhrases: Record<string, string> = {
  "toy-ball": "Play is the highest form of learning.",
  crown: "True nobility is being superior to your former self.",
  star: "Every journey begins with a single spark.",
  heart: "Love multiplies when shared.",
  cookie: "Small treats bring great joy.",
  crystal: "Clarity comes from patience.",
  feather: "Lightness of being frees the mind.",
  potion: "Transformation takes time.",
  book: "Wisdom is the reward of curiosity.",
  key: "Every lock has its moment of opening.",
  shell: "Even the ocean listens to the shore.",
  flower: "Bloom where you are planted.",
};

/* ─── EvolutionInventory ─── */
export function EvolutionInventory({
  items = [],
  className = "",
}: EvolutionInventoryProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className={className}>
      <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-widest mb-2.5">
        Inventory
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-xs text-foreground/30 italic">No items yet…</span>
        ) : (
          items.map((item) => {
            const emoji = itemEmojis[item] || "✨";
            const isSelected = selected === item;
            return (
              <button
                key={item}
                onClick={() => setSelected(isSelected ? null : item)}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-xl
                  transition-all duration-200 ease-out
                  ${isSelected ? "bg-white shadow-lg -translate-y-1 scale-110" : "bg-white/60 hover:bg-white/80 hover:-translate-y-0.5"}
                `}
                style={{
                  boxShadow: isSelected
                    ? "0 8px 24px rgba(0,0,0,0.12)"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                  animation: "aether-pop-in 0.3s ease-out both",
                }}
              >
                {emoji}
              </button>
            );
          })
        )}
      </div>
      {/* Selected item wisdom */}
      {selected && wisdomPhrases[selected] && (
        <div
          className="mt-3 px-3 py-2 rounded-lg text-xs text-foreground/60 italic animate-aether-thought-in"
          style={{
            background: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          &ldquo;{wisdomPhrases[selected]}&rdquo;
        </div>
      )}
    </div>
  );
}

/* ─── WisdomPortal ─── */
export function WisdomPortal({
  insights = [],
  level = 1,
  experience = 0,
  className = "",
}: WisdomPortalProps) {
  const xpForNext = level * 100;
  const xpPct = Math.min(100, (experience / xpForNext) * 100);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">
          Wisdom Portal
        </h3>
        <span className="text-xs font-bold text-foreground/70">
          Lv. {level}
        </span>
      </div>

      {/* XP bar */}
      <div className="mb-3">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
            style={{
              width: `${xpPct}%`,
              transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
        <span className="text-[10px] text-foreground/40 mt-0.5 block text-right">
          {experience}/{xpForNext} XP
        </span>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-1.5">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="px-2.5 py-1.5 rounded-lg text-xs text-foreground/50"
              style={{
                background: "rgba(139, 92, 246, 0.06)",
                border: "1px solid rgba(139, 92, 246, 0.1)",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {insight}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Combined export (A2UI maps to inventorySlot) */
export default function EvolutionInventoryAndWisdom({
  items = [],
  insights = [],
  level = 1,
  experience = 0,
  className = "",
}: EvolutionInventoryProps & WisdomPortalProps & { insights?: string[]; level?: number; experience?: number }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <EvolutionInventory items={items} />
      <div
        className="w-full h-px"
        style={{ background: "rgba(0,0,0,0.06)" }}
      />
      <WisdomPortal insights={insights} level={level} experience={experience} />
    </div>
  );
}
