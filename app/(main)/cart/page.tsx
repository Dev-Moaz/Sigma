// ── app/(main)/cart/page.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCartShopping,
  faTrashCan,
  faMinus,
  faPlus,
  faLock,
  faTag,
  faBoxOpen,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme, useCart } from "@/store/useAppStore";

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE CLEAN & PREMIUM COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function NoiseGrain({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity, mixBlendMode: "overlay" }}
    >
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="vt-noise-grain-cart">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#vt-noise-grain-cart)" />
      </svg>
    </div>
  );
}

function PremiumButton({ children, onClick, className = "", variant = "primary", disabled = false }: any) {
  const { t, theme } = useTheme();
  const isPrimary = variant === "primary";

  return (
    <motion.button
      disabled={disabled}
      onClick={onClick}
      className={`relative overflow-hidden flex items-center justify-center gap-2 h-14 px-8 rounded-2xl text-[15px] font-bold tracking-wide transition-all duration-300 focus:outline-none ${className}`}
      style={{
        color: isPrimary ? "#ffffff" : t.text,
        background: isPrimary
          ? theme === "dark"
            ? "linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #7c3aed 100%)"
            : "linear-gradient(135deg, #06b6d4 0%, #2563eb 50%, #7c3aed 100%)"
          : t.bgSecondary,
        border: isPrimary ? "none" : `1px solid ${t.borderSubtle}`,
        boxShadow: isPrimary
          ? "0 10px 30px -10px rgba(14,165,233,0.5)"
          : `0 4px 15px rgba(0,0,0,0.03)`,
        opacity: disabled ? 0.6 : 1,
      }}
      whileHover={disabled ? {} : { scale: 1.01, filter: "brightness(1.1)" }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {/* Subtle shine effect for primary button */}
      {isPrimary && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Cart() {
  const { theme, t } = useTheme();
  const { cartItems, cartCount, cartTotal, addToCart, removeFromCart } = useCart();

  const handleUpdateQuantity = (item: any, delta: number) => {
    if (item.qty + delta <= 0) {
      removeFromCart(item.id);
    } else {
      const { qty, ...itemWithoutQty } = item;
      addToCart(itemWithoutQty, delta);
    }
  };

  const taxes = cartTotal * 0.08;
  const shipping = cartTotal > 0 ? 0 : 0;
  const total = cartTotal + taxes + shipping;

  const gradientTextClass = `bg-clip-text text-transparent bg-gradient-to-r ${
    theme === "dark"
      ? "from-[#06b6d4] via-[#3b82f6] to-[#7c3aed]"
      : "from-[#0891b2] via-[#2563eb] to-[#7c3aed]"
  }`;

  return (
    <section
      className="relative min-h-screen overflow-hidden py-32 pt-16"
      style={{ backgroundColor: t.bg }}
    >
      <NoiseGrain />

      {/* ── Minimalist Background ── */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${t.gridStroke} 1px, transparent 1px), linear-gradient(90deg, ${t.gridStroke} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "linear-gradient(to bottom, black 20%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 80%)",
          }}
        />
        <div
          className="w-[800px] h-[800px] rounded-full blur-[160px] opacity-[0.08] absolute top-[-20%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${t.glowCyan}, ${t.glowPurple})` }}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col min-h-[70vh]">
        
        {/* Header (Typography Focus) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border backdrop-blur-sm"
                style={{ background: `${t.bgSecondary}80`, borderColor: t.borderSubtle }}
              >
                <FontAwesomeIcon icon={faCartShopping} className="text-[14px]" style={{ color: t.accentText }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: t.textSecondary }}>
                Secure Checkout
              </span>
            </div>
            {/* استخدام كلاس hf الخاص بك للعناوين مع Tracking */}
            <h1 className={`hf text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.1] tracking-tighter ${gradientTextClass}`}>
              Your Cart.
            </h1>
          </div>
          {cartItems.length > 0 && (
            <p className="hf text-lg font-medium tracking-wide" style={{ color: t.textSubtle }}>
              {cartCount} {cartCount === 1 ? "Item" : "Items"}
            </p>
          )}
        </motion.div>

        {/* Dynamic Cart Area */}
        <AnimatePresence mode="wait">
          {cartItems.length === 0 ? (
            /* ════ EMPTY STATE (Editorial Design) ════ */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center text-center py-24"
            >
              <div
                className="w-24 h-24 mb-10 rounded-[2rem] flex items-center justify-center border backdrop-blur-xl transition-all duration-700"
                style={{ background: `${t.cardBg}50`, borderColor: t.borderSubtle, boxShadow: `0 20px 40px ${t.glowCyan}10` }}
              >
                <FontAwesomeIcon icon={faBoxOpen} className="text-3xl" style={{ color: t.textMuted }} />
              </div>
              <h2 className="hf text-4xl font-extrabold tracking-tight mb-4" style={{ color: t.text }}>
                Your cart is empty.
              </h2>
              <p className="text-[16px] leading-relaxed font-medium max-w-md mx-auto mb-10" style={{ color: t.textSecondary }}>
                Looks like you haven't added anything yet. Discover our latest next-gen hardware and gear up for greatness.
              </p>
              <PremiumButton variant="primary" onClick={() => window.location.href = "/shop"}>
                Explore Collection <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
              </PremiumButton>
            </motion.div>
          ) : (
            /* ════ FILLED STATE ════ */
            <motion.div
              key="filled-state"
              className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14 relative items-start"
            >
              {/* Left Column: Item List */}
              <div className="flex flex-col gap-6">
                <AnimatePresence>
                  {cartItems.map((item: any, index: number) => {
                    const itemBrand = item.brand || "Sigma";
                    const itemSpecs = item.specs || ["Premium Edition"];
                    const itemColor = item.colorHex || t.accentText;
                    const itemImage = item.image || "https://www.transparenttextures.com/patterns/stardust.png";

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, scale: 0.98 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        key={item.id}
                        className="group flex flex-col sm:flex-row gap-6 p-5 sm:p-6 rounded-[2rem] transition-all duration-300"
                        style={{
                          background: t.cardBg,
                          border: `1px solid ${t.borderLight}`,
                          boxShadow: `0 10px 30px rgba(0,0,0,0.02)`,
                        }}
                      >
                        {/* Item Image with subtle inner shadow */}
                        <div
                          className="relative w-full sm:w-36 h-36 rounded-2xl flex items-center justify-center shrink-0 border overflow-hidden"
                          style={{ background: t.bgSecondary, borderColor: t.borderSubtle, boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}
                        >
                          <div
                            className="w-3/4 h-3/4 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${itemImage})` }}
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: itemColor }}>
                                {itemBrand}
                              </p>
                              {/* استخدام hf لاسم المنتج */}
                              <h3 className="hf text-[19px] font-bold leading-snug mb-3 tracking-tight" style={{ color: t.text }}>
                                {item.name}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {itemSpecs.map((spec: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 text-[9px] uppercase tracking-widest font-semibold rounded border"
                                    style={{ background: t.bg, color: t.textSecondary, borderColor: t.borderSubtle }}
                                  >
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              {/* استخدام hf للسعر */}
                              <span className="hf text-2xl font-extrabold block tracking-tight" style={{ color: t.text }}>
                                ${(item.price * item.qty).toLocaleString()}
                              </span>
                              {item.qty > 1 && (
                                <span className="text-[12px] font-medium mt-1 inline-block" style={{ color: t.textSubtle }}>
                                  ${item.price.toLocaleString()} each
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Controls Bottom Row */}
                          <div className="flex items-center justify-between mt-auto pt-5 border-t" style={{ borderColor: t.borderSubtle }}>
                            {/* Premium Quantity Selector */}
                            <div
                              className="flex items-center gap-4 px-1 py-1 rounded-xl border"
                              style={{ background: t.bg, borderColor: t.borderSubtle }}
                            >
                              <button
                                onClick={() => handleUpdateQuantity(item, -1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none"
                                style={{ color: t.textSecondary }}
                              >
                                <FontAwesomeIcon icon={faMinus} className="text-[10px]" />
                              </button>
                              <span className="hf text-[15px] font-bold w-6 text-center" style={{ color: t.text }}>
                                {item.qty}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item, 1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none"
                                style={{ color: t.textSecondary }}
                              >
                                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="group/btn flex items-center gap-2 text-[12px] uppercase tracking-wider font-bold transition-colors focus:outline-none"
                              style={{ color: t.textSubtle }}
                            >
                              <FontAwesomeIcon icon={faTrashCan} className="transition-colors group-hover/btn:text-red-500" />
                              <span className="hidden sm:inline transition-colors group-hover/btn:text-red-500">Remove</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Right Column: Order Summary (Frosted Glass Editorial Card) */}
              <div className="sticky top-32 z-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                  className="rounded-[2rem] p-7 sm:p-9 backdrop-blur-2xl border"
                  style={{
                    background: `${t.cardBg}cc`, // شفافية خفيفة للزجاج
                    borderColor: t.borderLight,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  <h3 className="hf text-2xl font-extrabold mb-8 tracking-tight" style={{ color: t.text }}>
                    Order Summary
                  </h3>

                  <div className="space-y-5 mb-8">
                    <div className="flex justify-between items-center text-[15px] font-medium" style={{ color: t.textSecondary }}>
                      <span>Subtotal</span>
                      <span className="hf font-bold text-[17px]" style={{ color: t.text }}>${cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[15px] font-medium" style={{ color: t.textSecondary }}>
                      <span>Estimated Taxes</span>
                      <span className="hf font-bold text-[17px]" style={{ color: t.text }}>${taxes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[15px] font-medium" style={{ color: t.textSecondary }}>
                      <span>Shipping</span>
                      <span className="hf font-bold text-[17px] text-[#10b981] uppercase tracking-wider text-[13px]">Free</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t mb-8" style={{ borderColor: t.borderSubtle }}>
                    <div className="flex justify-between items-end">
                      <span className="text-[12px] uppercase font-bold tracking-[0.15em] mb-1" style={{ color: t.textSubtle }}>Total Amount</span>
                      <span className={`hf text-[40px] font-extrabold leading-none tracking-tighter ${gradientTextClass}`}>
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Promo Code Input (Premium variant) */}
                  <div className="mb-8 relative group">
                    <FontAwesomeIcon icon={faTag} className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] transition-colors" style={{ color: t.textMuted }} />
                    <input
                      type="text"
                      placeholder="Enter Promo Code"
                      className="w-full h-14 bg-transparent rounded-2xl pl-12 pr-4 text-[14px] font-medium outline-none transition-all duration-300"
                      style={{
                        color: t.text,
                        background: t.bg,
                        border: `1px solid ${t.borderSubtle}`,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = t.accentText;
                        e.target.style.boxShadow = `0 0 0 3px ${t.glowCyan}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = t.borderSubtle;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <PremiumButton variant="primary" className="w-full h-16">
                    <FontAwesomeIcon icon={faLock} className="text-[13px] opacity-80" /> Checkout Securely
                  </PremiumButton>

                  <div className="mt-6 flex items-center justify-center gap-2.5">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-[12px]" style={{ color: t.textMuted }} />
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: t.textMuted }}>
                      256-Bit Encrypted
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}