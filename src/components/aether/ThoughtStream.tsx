import React, { useEffect, useState } from "react";

interface ThoughtStreamProps {
  text?: string;
  visible?: boolean;
  thinking?: boolean;
  offsetX?: number;
  offsetY?: number;
  className?: string;
}

export default function ThoughtStream({
  text = "...",
  visible = true,
  thinking = false,
  offsetX = 0,
  offsetY = -30,
  className = "",
}: ThoughtStreamProps) {
  const [currentText, setCurrentText] = useState(text);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (thinking) {
      const interval = setInterval(() => {
        setDots((d) => (d + 1) % 4);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [thinking]);

  useEffect(() => {
    setCurrentText(text);
    setDots(0);
  }, [text]);

  if (!visible) return null;

  return (
    <div
      className={`absolute pointer-events-none animate-aether-thought-in ${className}`}
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
      }}
    >
      {/* Bubble tail */}
      <div className="relative">
        <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white/90 rotate-45 transform" />
        {/* Main bubble */}
        <div
          className="relative px-4 py-2.5 rounded-2xl backdrop-blur-sm max-w-[200px]"
          style={{
            background: "rgba(255, 255, 255, 0.90)",
            boxShadow:
              "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <p className="text-sm leading-relaxed text-foreground/80 font-medium">
            {thinking ? (
              <span className="inline-flex items-center gap-0.5">
                <span>thinking</span>
                <span className="inline-block w-4 text-left">
                  {".".repeat(dots)}
                </span>
              </span>
            ) : (
              currentText
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
