import React from "react";

interface AetherBackgroundProps {
  variant?: "room" | "park" | "bedroom" | "void" | "golden-room" | string;
  moodTint?: "happy" | "sad" | "sleepy" | "excited" | "hungry" | "neutral" | "grumpy" | "dance" | string;
  className?: string;
}

const gradients: Record<string, string> = {
  room: "from-amber-50 via-yellow-50 to-orange-50",
  park: "from-emerald-50 via-green-50 to-teal-50",
  bedroom: "from-blue-50 via-indigo-50 to-slate-50",
  void: "from-indigo-950 via-violet-950 to-slate-950",
  "golden-room": "from-yellow-100 via-amber-50 to-yellow-50",
};

const moodOverlays: Record<string, string> = {
  happy: "bg-yellow-200/10",
  sad: "bg-blue-300/10",
  sleepy: "bg-violet-300/15",
  excited: "bg-pink-300/10",
  hungry: "bg-orange-300/10",
  neutral: "bg-transparent",
  grumpy: "bg-stone-400/10",
  dance: "bg-fuchsia-300/15",
};

export default function AetherBackground({
  variant = "room",
  moodTint = "neutral",
  className,
}: AetherBackgroundProps) {
  const gradient = gradients[variant] || gradients.room;
  const overlay = moodOverlays[moodTint] || moodOverlays.neutral;

  return (
    <>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-1000 ease-in-out`}
      />
      <div
        className={`absolute inset-0 ${overlay} mix-blend-overlay transition-all duration-1000 ease-in-out`}
      />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 60%)",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)",
      }} />
    </>
  );
}
