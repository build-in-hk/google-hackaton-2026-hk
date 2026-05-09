import React, { useCallback } from "react";

interface ActionItem {
  id: string;
  label: string;
  icon: string;
}

interface ActionSanctumProps {
  actions?: string[];
  onAction?: (action: string) => void;
  columns?: number;
  className?: string;
}

const iconMap: Record<string, string> = {
  feed: "🍎",
  play: "🎾",
  sleep: "🌙",
  talk: "💬",
  hug: "🤗",
  dance: "💃",
  clean: "🧹",
  gift: "🎁",
  explore: "🗺️",
  train: "🏋️",
};

const defaultActions: ActionItem[] = ["feed", "play", "sleep", "talk", "hug", "dance"].map(
  (id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    icon: iconMap[id] || "✨",
  })
);

export default function ActionSanctum({
  actions,
  onAction,
  columns = 3,
  className = "",
}: ActionSanctumProps) {
  const actionIds: string[] = actions ?? defaultActions.map((a) => a.id);
  const items: ActionItem[] = actionIds.map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    icon: iconMap[id] || "✨",
  }));

  const handleClick = useCallback(
    (actionId: string) => {
      if (onAction) {
        onAction(actionId);
      }
      // Also dispatch to global for A2UI compatibility
      const w = window as unknown as Record<string, unknown>;
      if (typeof w.__onAction === "function") {
        (w.__onAction as (action: string) => void)(actionId);
      }
    },
    [onAction]
  );

  return (
    <div
      className={`grid gap-2.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item.id)}
          className="group relative px-3 py-2.5 rounded-xl font-medium text-sm
                     bg-white/70 hover:bg-white/90
                     border border-white/60
                     text-foreground/70 hover:text-foreground
                     backdrop-blur-sm
                     transition-all duration-200 ease-out
                     hover:-translate-y-0.5
                     active:translate-y-0
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          style={{
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
          }}
        >
          <span className="flex items-center justify-center gap-1.5">
            <span
              className="text-lg transition-transform duration-200 group-hover:scale-110"
            >
              {item.icon}
            </span>
            <span className="capitalize">{item.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
