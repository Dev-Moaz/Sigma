// components/ui/Particles.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/store/useAppStore";

interface ParticlesProps {
  count?: number;
  className?: string;
  /** If true, only animates when hovered (controlled by parent) */
  active?: boolean;
}

/**
 * Cinematic background particles that drift upward.
 * Optimized for GPU performance using translate3d.
 */
export function Particles({ count = 30, className = "", active = true }: ParticlesProps) {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const generated = Array.from({ length: count }).map(() => ({
      size: Math.random() * 4 + 1,
      xStart: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 15,
      blur: Math.random() > 0.5 ? "blur(3px)" : "blur(0px)",
      opacityBase: Math.random() * 0.4 + 0.1,
      xAnim1: Math.random() * 60 - 30,
      xAnim2: Math.random() * 60 - 30,
    }));
    setParticles(generated);
    setIsMounted(true);
  }, [count]);

  if (!isMounted) return null;

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none will-change-transform ${className}`}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ 
            width: p.size, 
            height: p.size, 
            left: `${p.xStart}%`, 
            background: theme === "dark" ? "#fff" : "#000", 
            filter: p.blur,
            willChange: "transform, opacity"
          }}
          initial={{ y: "110vh", opacity: 0, x: 0 }}
          animate={active ? { 
            y: "-10vh", 
            opacity: [0, p.opacityBase, p.opacityBase, 0], 
            x: [0, p.xAnim1, p.xAnim2] 
          } : { opacity: 0 }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}
