// components/ui/ProductUI.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfStroke, faFire, faTag, faBolt } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/store/useAppStore";

/* ─── Badge Pill ─────────────────────────────────────────────── */

export const BADGE_CONFIG = {
  NEW:     { icon: faStar,  gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",  label: "NEW"     },
  HOT:     { icon: faFire,  gradient: "linear-gradient(135deg,#f97316,#ef4444)",  label: "HOT"     },
  SALE:    { icon: faTag,   gradient: "linear-gradient(135deg,#10b981,#06b6d4)",  label: "SALE"    },
  LIMITED: { icon: faBolt,  gradient: "linear-gradient(135deg,#a855f7,#7c3aed)",  label: "LIMITED" },
} as const;

export function BadgePill({ type }: { type: keyof typeof BADGE_CONFIG }) {
  const cfg = BADGE_CONFIG[type];
  if (!cfg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white gpu-accel"
      style={{
        background: cfg.gradient,
        animation: "pc-badge-glow 3s ease-in-out infinite",
      }}
    >
      <FontAwesomeIcon icon={cfg.icon} className="text-[9px]" />
      <span className="pc-dm text-[9px] font-extrabold tracking-[0.15em]">{cfg.label}</span>
    </motion.div>
  );
}

/* ─── Star Rating ─────────────────────────────────────────────── */

export function StarRating({ rating }: { rating: number }) {
  const { t } = useTheme();

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const half   = !filled && i + 0.5 < rating;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: -30 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.04 * i, duration: 0.35, ease: "backOut" }}
          >
            <FontAwesomeIcon
              icon={half ? faStarHalfStroke : faStar}
              className="text-[11px]"
              style={{
                color: filled || half ? "#f59e0b" : t.borderLight,
              }}
            />
          </motion.span>
        );
      })}
    </div>
  );
}

/* ─── Stock Bar ───────────────────────────────────────────────────────────────── */

export function StockBar({ stock }: { stock: number }) {
  const { t } = useTheme();
  const pct   = Math.min(100, (stock / 50) * 100);
  const color = pct > 60 ? "#10b981" : pct > 25 ? "#f59e0b" : "#ef4444";
  const label = pct > 60 ? "In Stock" : pct > 25 ? "Low Stock" : "Almost Gone";

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }}>
        <div className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: color }} />
      </div>
      <span className="pc-dm text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: t.borderLight }}
      >
        <motion.div
          className="h-full rounded-full gpu-accel origin-left"
          style={{ width: "100%", background: color }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: pct / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </div>
      <span className="pc-dm text-[10px] font-bold tabular-nums" style={{ color: t.textSubtle }}>
        {stock}
      </span>
    </div>
  );
}
