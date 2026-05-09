import React, { useEffect, useRef, useState } from "react";

interface AetherSceneProps {
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
  className?: string;
  overflow?: "hidden" | "visible" | "auto";
}

export default function AetherScene({
  width = "100%",
  height = 480,
  children,
  className = "",
  overflow = "hidden",
}: AetherSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        width,
        height,
        overflow,
        opacity: ready ? 1 : 0,
        transform: ready ? "scale(1)" : "scale(0.97)",
        transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {children}
    </div>
  );
}
