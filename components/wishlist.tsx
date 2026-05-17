// components/wishlist.tsx
"use client";

import React, { useRef } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faArrowRight,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme, useWishlist, useCart } from "@/store/useAppStore";
import ProductCard from "@/components/ui/ProductCard";
import laptopsData from "@/data/laptops.json";
import type { Product } from "@/lib/laptop-schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { Particles } from "@/components/ui/Particles";

function GridBg() {
  const { t } = useTheme();
  return (
    <svg aria-hidden className="absolute inset-0 w-[110%] h-[110%] left-[-5%] top-[-5%] opacity-[0.07] pointer-events-none">
      <defs>
        <pattern id="grid-wishlist" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke={t.gridStroke} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-wishlist)" />
    </svg>
  );
}

import { CinematicReveal as CinematicScrollReveal } from "@/components/ui/CinematicReveal";
import { AccentLine } from "@/components/ui/AccentLine";

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  const { t, theme } = useTheme();

  return (
    <CinematicScrollReveal delay={0.2}>
      <div className="flex flex-col items-center justify-center py-32 gap-8">
        {/* Pulsing heart icon */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: "rgba(239,68,68,0.18)" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: theme === "dark" ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <FontAwesomeIcon
              icon={faHeart}
              className="text-4xl"
              style={{ color: "#ef4444", filter: "drop-shadow(0 0 12px rgba(239,68,68,0.5))" }}
            />
          </motion.div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h3
            className="hf text-3xl font-extrabold mb-3"
            style={{ color: t.text }}
          >
            Your Wishlist is Empty
          </h3>
          <p
            className="text-[15px] font-medium leading-relaxed max-w-sm"
            style={{ color: t.textSecondary }}
          >
            Start exploring and save the laptops you love — they'll show up right here.
          </p>
        </div>

        {/* CTA */}
        <motion.a
          href="/"
          className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm"
          style={{
            background: theme === "dark"
              ? "linear-gradient(135deg,#0ea5e9 0%,#2563eb 60%,#7c3aed 100%)"
              : "linear-gradient(135deg,#06b6d4 0%,#2563eb 70%,#7c3aed 100%)",
            color: "#fff",
            boxShadow: "0 8px 28px rgba(6,182,212,0.28)",
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          Browse Laptops
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </motion.a>
      </div>
    </CinematicScrollReveal>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Wishlist() {
  const { theme, t } = useTheme();
  const { wishIds, toggleWish } = useWishlist();
  const { addToCart } = useCart();

  const wishedProducts = (laptopsData as Product[]).filter((p) =>
    wishIds.includes(p.id)
  );

  return (
    <>
      {/* Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wl-float-up {
          0%   { transform: translateY(110%) translateX(0);         opacity: 0;        }
          10%  { opacity: var(--op);                                                   }
          90%  { opacity: var(--op);                                                   }
          100% { transform: translateY(-10%) translateX(var(--tx)); opacity: 0;        }
        }
      `}} />

      <section
        className="bf relative overflow-hidden min-h-screen"
        style={{ backgroundColor: t.bg }}
      >
        {/* ── Vignette — z-40 ── */}
        <div
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            background: `radial-gradient(circle at center, transparent 30%, ${
              theme === "dark" ? "#000000e6" : "#00000040"
            } 110%)`,
            mixBlendMode: theme === "dark" ? "normal" : "multiply",
          }}
        />

        {/* ── Slow-drift bg — z-0 ── */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          animate={{ scale: [1, 1.05] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        >
          <GridBg />
          <Particles count={20} />
        </motion.div>

        {/* ── Glow orbs ── */}
        <motion.div
          className="absolute rounded-full blur-[140px] pointer-events-none z-0"
          style={{
            width: 700, height: 700,
            background: `radial-gradient(circle, ${t.glowCyan}, transparent)`,
            top: "-20%", left: "5%",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[160px] pointer-events-none z-0"
          style={{
            width: 600, height: 600,
            background: `radial-gradient(circle, ${t.glowPurple}, transparent)`,
            bottom: "-10%", right: "0%",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* ── Accent top line ── */}
        <AccentLine duration={5} />

        {/* ── Radial edge mask ── */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, ${t.radialMask} 75%)`,
          }}
        />

        {/* ── Main content — z-10 ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">

          {/* Header */}
          <CinematicScrollReveal delay={0.1}>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-1 h-6 rounded-full shrink-0"
                  style={{
                    background: "linear-gradient(180deg,#06b6d4,#3b82f6)",
                    boxShadow: "0 0 10px rgba(6,182,212,0.8)",
                  }}
                />
                <span
                  className="hf text-[13px] font-extrabold uppercase tracking-[0.2em]"
                  style={{ color: t.accentText }}
                >
                  My Collection
                </span>
              </div>

              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h1
                    className="hf text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-none tracking-tight"
                    style={{ color: t.text }}
                  >
                    Wishlist
                    {wishedProducts.length > 0 && (
                      <span
                        className="ml-4 text-[clamp(1.2rem,3vw,2rem)] bg-clip-text text-transparent"
                        style={{
                          backgroundImage: theme === "dark"
                            ? "linear-gradient(to right, #06b6d4, #3b82f6)"
                            : "linear-gradient(to right, #0891b2, #2563eb)",
                        }}
                      >
                        ({wishedProducts.length})
                      </span>
                    )}
                  </h1>
                  <p
                    className="text-[15px] font-medium mt-2"
                    style={{ color: t.textSecondary }}
                  >
                    {wishedProducts.length > 0
                      ? "Laptops you've saved for later."
                      : "No saved laptops yet."}
                  </p>
                </div>

                {/* Add all to cart */}
                <AnimatePresence>
                  {wishedProducts.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        wishedProducts.forEach((p) =>
                          addToCart({ id: p.id, name: p.name, price: p.price, image: p.image }, 1)
                        );
                      }}
                      className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm"
                      style={{
                        background: t.cardBg,
                        border: `1px solid ${t.borderLight}`,
                        color: t.text,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      }}
                    >
                      <FontAwesomeIcon icon={faCartShopping} style={{ color: t.accentText }} />
                      Add All to Cart
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="mt-8 h-px" style={{ background: t.borderLight }} />
            </div>
          </CinematicScrollReveal>

          {/* Content */}
          <AnimatePresence mode="wait">
            {wishedProducts.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState />
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {wishedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onAddToCart={(p, color) =>
                      addToCart(
                        { id: p.id, name: p.name, price: p.price, image: p.image },
                        1
                      )
                    }
                    onWishlist={(p) => toggleWish(p.id)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </>
  );
}