// components/ui/CinematicReveal.tsx
"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface CinematicRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
  yOffset?: number;
  blur?: string;
}

/**
 * Standard cinematic scroll reveal wrapper used across the project.
 * Uses blur and translate-y for a premium feel.
 */
export function CinematicReveal({
  children,
  delay = 0,
  className = "",
  duration = 1.2,
  yOffset = 60,
  blur = "15px",
}: CinematicRevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, filter: `blur(${blur})` }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
