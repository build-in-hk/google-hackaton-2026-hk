"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import AetherScene from "@/components/aether/AetherScene";
import AetherBackground from "@/components/aether/AetherBackground";
import PetEntity from "@/components/aether/PetEntity";
import MoodOrb from "@/components/aether/MoodOrb";
import ThoughtStream from "@/components/aether/ThoughtStream";
import VitalHorizon from "@/components/aether/VitalHorizon";
import ActionSanctum from "@/components/aether/ActionSanctum";
import EvolutionInventory, { WisdomPortal } from "@/components/aether/EvolutionInventory";

// ─── Pet Simulation ────────────────────────────────────────────────────────
type Mood = "neutral" | "happy" | "sad" | "sleepy" | "excited" | "hungry" | "grumpy" | "dance";
type Location = "room" | "park" | "bedroom" | "void";

interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
  affection: number;
}

const THOUGHTS: Record<string, string[]> = {
  feed: ["Yummy! 🍎", "That hit the spot~", "More snacks please!", "Tasty!"],
  play: ["So fun! 🎾", "Catch me if you can!", "Again again!", "Wheee~"],
  sleep: ["Zzz...", "So comfy~", "Sweet dreams...", "Goodnight..."],
  talk: ["Tell me more!", "I love chatting!", "Really? Wow!", "Hmm, interesting..."],
  hug: ["*happy noises*", "Warm hugs~", "Love you too!", "Squeeze!"],
  dance: ["Let's boogie! 💃", "Can't stop dancing!", "Feel the rhythm~", "Dance party!"],
  explore: ["What's over here?", "New place!", "So much to discover~", "Adventure!"],
  train: ["Getting stronger! 💪", "I can do it!", "One more rep!", "Level up!"],
};

const WISDOM: string[] = [
  "Play is the highest form of learning.",
  "Every journey begins with a single spark.",
  "Love multiplies when shared.",
  "Clarity comes from patience.",
  "Even the ocean listens to the shore.",
  "Bloom where you are planted.",
  "Transformation takes time.",
  "Wisdom is the reward of curiosity.",
];

function deriveMood(stats: PetStats): Mood {
  if (stats.energy < 20) return "sleepy";
  if (stats.hunger < 25) return "hungry";
  if (stats.happiness > 80 && stats.energy > 50) return "dance";
  if (stats.happiness > 65) return "happy";
  if (stats.happiness < 25) return "sad";
  if (stats.affection > 70) return "excited";
  return "neutral";
}

export default function AetherDemoPage() {
  const [stats, setStats] = useState<PetStats>({
    hunger: 60,
    happiness: 60,
    energy: 70,
    affection: 30,
  });
  const [location, setLocation] = useState<Location>("room");
  const [position, setPosition] = useState({ x: 350, y: 260 });
  const [thought, setThought] = useState("Hello! ✨");
  const [thoughtVisible, setThoughtVisible] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [inventory, setInventory] = useState<string[]>(["star", "heart"]);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(35);
  const [insights, setInsights] = useState<string[]>([
    "Your pet enjoys quiet moments.",
  ]);
  const animFrameRef = useRef<number>(0);
  const lastDecayRef = useRef(Date.now());

  // Natural stat decay over time
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

  // Gentle idle movement
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
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Random idle thoughts
  useEffect(() => {
    const idleThoughts = [
      "...",
      "What should we do?",
      "Feeling good~",
      "*stretches*",
      "Hmm~",
      "✨",
      "Anything fun today?",
    ];
    const interval = setInterval(() => {
      if (isThinking) return;
      setThought(idleThoughts[Math.floor(Math.random() * idleThoughts.length)]);
      setThoughtVisible(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [isThinking]);

  const handleAction = useCallback((action: string) => {
    setIsThinking(true);
    setThoughtVisible(false);

    // Simulate processing
    setTimeout(() => {
      const thoughts = THOUGHTS[action] || ["Nice!"];
      const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
      setThought(thought);
      setThoughtVisible(true);
      setIsThinking(false);

      // Update stats based on action
      setStats((prev) => {
        const next = { ...prev };
        switch (action) {
          case "feed":
            next.hunger = Math.min(100, prev.hunger + 20);
            next.happiness = Math.min(100, prev.happiness + 5);
            break;
          case "play":
            next.happiness = Math.min(100, prev.happiness + 15);
            next.energy = Math.max(0, prev.energy - 10);
            next.hunger = Math.max(0, prev.hunger - 5);
            break;
          case "sleep":
            next.energy = Math.min(100, prev.energy + 25);
            next.hunger = Math.max(0, prev.hunger - 5);
            break;
          case "talk":
            next.affection = Math.min(100, prev.affection + 10);
            next.happiness = Math.min(100, prev.happiness + 5);
            break;
          case "hug":
            next.affection = Math.min(100, prev.affection + 15);
            next.happiness = Math.min(100, prev.happiness + 10);
            break;
          case "dance":
            next.happiness = Math.min(100, prev.happiness + 20);
            next.energy = Math.max(0, prev.energy - 8);
            break;
          case "explore":
            next.happiness = Math.min(100, prev.happiness + 10);
            next.energy = Math.max(0, prev.energy - 12);
            break;
          case "train":
            next.energy = Math.max(0, prev.energy - 15);
            next.happiness = Math.min(100, prev.happiness + 8);
            break;
        }
        return next;
      });

      // Earn XP and sometimes items
      setExperience((prev) => {
        const next = prev + 10 + Math.floor(Math.random() * 5);
        const xpNeeded = level * 100;
        if (next >= xpNeeded) {
          setLevel((l) => l + 1);
          // Level-up reward
          const rewards = ["crystal", "feather", "potion", "book", "key"];
          const reward = rewards[Math.floor(Math.random() * rewards.length)];
          setInventory((inv) => [...inv, reward]);
          setInsights((prev) => [
            WISDOM[Math.floor(Math.random() * WISDOM.length)],
            ...prev.slice(0, 3),
          ]);
          return next - xpNeeded;
        }
        return next;
      });
    }, 600);
  }, [level]);

  const mood = deriveMood(stats);

  // Location cycling based on mood
  useEffect(() => {
    if (mood === "sleepy") setLocation("bedroom");
    else if (mood === "happy" || mood === "dance") setLocation("park");
    else if (mood === "sad") setLocation("void");
    else setLocation("room");
  }, [mood]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
          AetherPet
        </h1>
        <p className="text-foreground/50 mt-1 text-sm">
          Premium A2UI Components — 8 cinematic components in action
        </p>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-foreground/40">
          <span>Lv. {level}</span>
          <span>•</span>
          <span>{experience}/{level * 100} XP</span>
          <span>•</span>
          <span>{inventory.length} items</span>
        </div>
      </div>

      {/* Main Scene */}
      <div className="max-w-3xl mx-auto">
        <AetherScene height={420} className="shadow-2xl shadow-violet-200/40 border border-white/60">
          {/* Background */}
          <AetherBackground variant={location} moodTint={mood} />

          {/* Mood Orb */}
          <div className="absolute top-4 left-4 z-10">
            <MoodOrb mood={mood} size={36} />
          </div>

          {/* Thought Stream */}
          <ThoughtStream
            text={thought}
            visible={thoughtVisible}
            thinking={isThinking}
            offsetX={position.x + 50}
            offsetY={position.y - 50}
          />

          {/* Pet Entity */}
          <PetEntity
            x={position.x}
            y={position.y}
            size="big"
            expression={mood}
            id="aether-pet"
          />

          {/* Vital Horizon Stats */}
          <div className="absolute bottom-4 left-4 right-4 z-10 px-2">
            <div
              className="px-3 py-2.5 rounded-xl backdrop-blur-md"
              style={{
                background: "rgba(255,255,255,0.75)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              <VitalHorizon
                hunger={stats.hunger}
                happiness={stats.happiness}
                energy={stats.energy}
                affection={stats.affection}
                compact
              />
            </div>
          </div>
        </AetherScene>

        {/* Action Sanctum */}
        <div className="mt-4">
          <ActionSanctum
            onAction={handleAction}
            columns={5}
            actions={[
              "feed",
              "play",
              "sleep",
              "talk",
              "hug",
              "dance",
              "explore",
              "train",
            ]}
          />
        </div>

        {/* Inventory + Wisdom */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-2xl backdrop-blur-sm"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <EvolutionInventory items={inventory} />
          </div>
          <div
            className="p-4 rounded-2xl backdrop-blur-sm"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <WisdomPortal
              insights={insights}
              level={level}
              experience={experience}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
