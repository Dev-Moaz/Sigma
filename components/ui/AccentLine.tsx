// components/ui/AccentLine.tsx
"use client";

import { motion } from "framer-motion";

interface AccentLineProps {
  /** Animation cycle duration in seconds. Header uses 4, Footer uses 5. */
  duration?: number;
  /** Overall opacity of the line. Footer uses 0.6; Header uses 1 (full). */
  opacity?: number;
}

/**
 * Animated cyan-to-blue gradient line used at the top of Header and Footer.
 * Position it with `absolute top-0 left-0 right-0` on the parent (already
 * `relative / overflow-hidden`).
 */
export function AccentLine({ duration = 4, opacity = 1 }: AccentLineProps) {
  return (
    <motion.div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      animate={{
        background: [
          "linear-gradient(90deg,transparent 0%,#06b6d4 50%,transparent 100%)",
          "linear-gradient(90deg,transparent 10%,#3b82f6 50%,transparent 90%)",
          "linear-gradient(90deg,transparent 0%,#06b6d4 50%,transparent 100%)",
        ],
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      style={{ opacity }}
    />
  );
}