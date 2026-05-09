import React from "react";

interface StatEntry {
  label: string;
  value: number;
  color: string;
  glowColor: string;
  icon: string;
}

interface VitalHorizonProps {
  hunger?: number;
  happiness?: number;
  energy?: number;
  affection?: number;
  compact?: boolean;
  className?: string;
}

const stats: (props: VitalHorizonProps) => StatEntry[] = (p) => [
  {
    label: "Hunger",
    value: p.hunger ?? 50,
    color: "from-amber-400 to-yellow-500",
    glowColor: "shadow-amber-300/30",
    icon: "🍎",
  },
  {
    label: "Happiness",
    value: p.happiness ?? 50,
    color: "from-emerald-400 to-green-500",
    glowColor: "shadow-emerald-300/30",
    icon: "💛",
  },
  {
    label: "Energy",
    value: p.energy ?? 50,
    color: "from-blue-400 to-sky-500",
    glowColor: "shadow-blue-300/30",
    icon: "⚡",
  },
  {
    label: "Affection",
    value: p.affection ?? 50,
    color: "from-pink-400 to-rose-500",
    glowColor: "shadow-pink-300/30",
    icon: "❤️",
  },
];

export default function VitalHorizon({
  hunger = 50,
  happiness = 50,
  energy = 50,
  affection = 50,
  compact: _compact,
  className = "",
}: VitalHorizonProps) {
  const entries = stats({ hunger, happiness, energy, affection });

  return (
    <div className={`space-y-2.5 ${className}`}>
      {entries.map((stat) => {
        const pct = Math.max(0, Math.min(100, stat.value));
        return (
          <div key={stat.label} className="group">
            {/* Label row */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-sm">{stat.icon}</span>
                {stat.label}
              </span>
              <span className="text-xs font-bold text-foreground/80 tabular-nums">
                {pct.toFixed(0)}%
              </span>
            </div>
            {/* Track */}
            <div
              className="h-2 rounded-full overflow-hidden relative"
              style={{
                background: "rgba(0,0,0,0.06)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
              }}
            >
              {/* Fill */}
              <div
                className={`h-full rounded-full bg-gradient-to-r ${stat.color} relative`}
                style={{
                  width: `${pct}%`,
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Shimmer highlight */}
                <div
                  className="absolute inset-0 rounded-full opacity-60"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
