// components/ui/ProductCard.tsx
// Laptop Product Card - MAX PERFORMANCE EDITION (Clean Sharp UI, Zero Scroll Lag, Z-Index Fixed, Buy Now + Cart, Scaled Image)
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCartShopping,
  faStar,
  faChartBar,
  faCheck,
  faCodeCompare,
  faEye,
  faArrowRight,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { useTheme, useWishlist, useCompare, useCart } from "@/store/useAppStore";

import { CinematicReveal as CinematicScrollReveal } from "@/components/ui/CinematicReveal";
import type { Product, ProductSpec, ColorVariant } from "@/lib/laptop-schema";

export type { Product };

// ─── Props ───

interface ProductCardProps {
  product: Product;
  index?: number;
  onAddToCart?: (product: Product, color?: ColorVariant) => void;
  onBuyNow?: (product: Product, color?: ColorVariant) => void;
  onWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  isWished?: boolean;
}

// ─── Theme-Decoupled Accent Orbs ───

const ORBS = {
  cyan:   { color: "#06b6d4", bg: "rgba(6,182,212,0.09)"   },
  purple: { color: "#8b5cf6", bg: "rgba(139,92,246,0.09)"  },
  amber:  { color: "#f59e0b", bg: "rgba(245,158,11,0.09)"  },
  rose:   { color: "#f43f5e", bg: "rgba(244,63,94,0.09)"   },
} as const;
type OrbKey = keyof typeof ORBS;
const ORB_KEYS: OrbKey[] = ["cyan", "purple", "amber", "rose"];

// ─── CSS Keyframes + Font Loader + GPU Classes (Cleaned) ───

const CardKeyframes = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

    .pc-bebas  { font-family: 'Bebas Neue', sans-serif !important; letter-spacing: 0.04em; }
    .pc-outfit { font-family: 'Outfit', sans-serif !important; }
    .pc-space  { font-family: 'Space Grotesk', sans-serif !important; }

    /* Force GPU Rendering */
    .gpu-accel {
      transform: translateZ(0);
      will-change: transform;
    }

    @keyframes pc-pulse-opacity {
      0%, 100%  { opacity: 0.35; }
      50%       { opacity: 1;    }
    }
    @keyframes pc-shimmer-sweep {
      0%        { transform: translateX(-150%) skewX(-12deg) translateZ(0); }
      50%, 100% { transform: translateX(250%)  skewX(-12deg) translateZ(0); }
    }
    @keyframes pc-bounce-subtle {
      0%, 100%  { transform: translateY(0) translateZ(0);    }
      50%       { transform: translateY(-4px) translateZ(0); }
    }
    @keyframes pc-cart-success {
      0%   { transform: scale(1) translateZ(0);    }
      30%  { transform: scale(1.15) translateZ(0); }
      60%  { transform: scale(0.9) translateZ(0);  }
      100% { transform: scale(1) translateZ(0);    }
    }
  `,
    }}
  />
);

// ─── SpecRing (animated SVG progress ring + value label) ───

function SpecRing({
  spec,
  pct,
  orbKey,
  delay = 0,
  visible,
}: {
  spec: ProductSpec;
  pct: number;
  orbKey: OrbKey;
  delay?: number;
  visible: boolean;
}) {
  const orb = ORBS[orbKey];
  const { t } = useTheme();
  const R = 20;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - pct / 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.55, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.55, y: 10 }}
          transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center gap-1.5 gpu-accel"
        >
          {/* Ring */}
          <div className="relative" style={{ width: 52, height: 52 }}>
            <svg
              width="52"
              height="52"
              viewBox="0 0 52 52"
              className="absolute inset-0 gpu-accel"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle cx="26" cy="26" r={R} fill="none" stroke={orb.bg} strokeWidth="2.5" />
              <circle
                cx="26"
                cy="26"
                r={R}
                fill="none"
                stroke={orb.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${circ}`}
                strokeDashoffset={dashOffset}
                style={{
                  transition: `stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1) ${delay + 0.15}s`,
                }}
              />
            </svg>
            {/* Center glow dot */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full"
              style={{ background: orb.bg }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: orb.color,
                  animation: "pc-pulse-opacity 2s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="text-center leading-none">
            <p className="pc-bebas text-[13px]" style={{ color: orb.color }}>
              {spec.value}
            </p>
            <p
              className="pc-outfit text-[7.5px] uppercase tracking-[0.12em] opacity-55 mt-0.5 font-semibold"
              style={{ color: t.textSecondary }}
            >
              {spec.label}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── HUD Spec Badge (GPU Transform Scale) ───

function HudBadge({
  spec,
  visible,
  side,
  offsetY,
  delay,
}: {
  spec: ProductSpec;
  visible: boolean;
  side: "left" | "right";
  offsetY: string;
  delay: number;
}) {
  const { t } = useTheme();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: side === "left" ? 20 : -20, scale: 0.85 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: side === "left" ? 20 : -20, scale: 0.85 }}
          transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute z-30 pointer-events-none gpu-accel"
          style={{
            [side === "left" ? "right" : "left"]: "calc(100% + 10px)",
            top: offsetY,
            transform: "translateY(-50%)",
          }}
        >
          <div
            className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl border whitespace-nowrap overflow-hidden gpu-accel"
            style={{
              background: t.bgSecondary,
              borderColor: `${spec.color}30`,
              boxShadow: `0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)`,
              animation: `pc-bounce-subtle 3.5s ease-in-out ${delay}s infinite`,
            }}
          >
            {/* Subtle tinted fill */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${spec.color}10, transparent 65%)`,
              }}
            />

            {/* Connector line toward card */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.65, ease: "circOut" }}
              className="absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none gpu-accel"
              style={{
                [side === "left" ? "left" : "right"]: "100%",
                flexDirection: side === "left" ? "row" : "row-reverse",
                width: 32,
                transformOrigin: side === "left" ? "right center" : "left center",
              }}
            >
              <div
                className="h-px w-full"
                style={{
                  background: `linear-gradient(to ${side === "left" ? "left" : "right"}, ${spec.color}85, transparent)`,
                }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: spec.color }}
              />
            </motion.div>

            {/* Live ping dot */}
            <div
              className="relative w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: spec.color }}
            >
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-55"
                style={{ background: spec.color }}
              />
            </div>

            <div className="leading-tight">
              <p
                className="pc-space text-[7.5px] uppercase tracking-[0.14em] font-semibold opacity-48 mb-0.5"
                style={{ color: t.textSecondary }}
              >
                {spec.label}
              </p>
              <p
                className="pc-bebas text-[15px] tracking-wide leading-none"
                style={{ color: t.text }}
              >
                {spec.value}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Badge Pill ───

import { StarRating, BadgePill } from "@/components/ui/ProductUI";

// ─── Main ProductCard Component (React.memo Optimized) ───

const ProductCard = React.memo(
  function ProductCardComponent({
    product,
    index = 0,
    onAddToCart,
    onBuyNow,
    onWishlist,
    onQuickView,
    onCompare,
    isWished: isWishedProp,
  }: ProductCardProps) {
    const { isDark, t } = useTheme();
    const router = useRouter();

    const { wishIds, toggleWish } = useWishlist();
    const { addToCart } = useCart();
    const isWished = isWishedProp !== undefined ? isWishedProp : wishIds.includes(product.id);

    const [isHovered,     setIsHovered]     = useState(false);
    const [isCartAdded,   setIsCartAdded]   = useState(false);
    const { compareIds, toggleCompare: storeToggleCompare } = useCompare();
    const isCompared = compareIds.includes(product.id);
    const [selectedColor, setSelectedColor] = useState<ColorVariant | undefined>(
      product.colorVariants?.[0]
    );

    const cardRef = useRef<HTMLDivElement>(null);

    // Image mouse-tracking (Light physics for CPU performance)
    const imgX  = useMotionValue(0);
    const imgY  = useMotionValue(0);
    const imgSX = useSpring(imgX, { stiffness: 80, damping: 25, mass: 0.5 });
    const imgSY = useSpring(imgY, { stiffness: 80, damping: 25, mass: 0.5 });

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      imgX.set(0);
      imgY.set(0);
    }, [imgX, imgY]);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
        const cy = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
        imgX.set(cx * 9);
        imgY.set(cy * 9);
      },
      [imgX, imgY]
    );

    const handleCardClick = useCallback(() => {
      router.push(`/product/${encodeURIComponent(product.id)}`);
    }, [router, product.id]);

    useEffect(() => {
      if (!isCartAdded) return;
      const timer = setTimeout(() => setIsCartAdded(false), 2000);
      return () => clearTimeout(timer);
    }, [isCartAdded]);

    const discount = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
    const formattedPrice    = product.price.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
    const formattedOriginal = product.originalPrice?.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

    // تأمين الـ specs بقيم افتراضية مرنة لمنع حدوث انهيارات برمجية
    const specs = product.specs || [];
    const leftSpecs  = specs.filter((_, i) => i % 2 === 0).slice(0, 2);
    const rightSpecs = specs.filter((_, i) => i % 2 !== 0).slice(0, 2);
    const ringSpecs = specs.slice(0, 3);
    const RING_PCTS = [84, 92, 76, 68, 88];

    // Actions
    const handleCartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsCartAdded(true);
      if (onAddToCart) onAddToCart(product, selectedColor);
      else addToCart({ id: product.id, name: product.name, price: product.price, image: product.images[0] }, 1);
    };

    const handleBuyNowClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onBuyNow) onBuyNow(product, selectedColor);
      else {
        addToCart({ id: product.id, name: product.name, price: product.price, image: product.images[0] }, 1);
        router.push('/checkout');
      }
    };

    // إعدادات شريط المخزون المدمج
    const stockCount = product.stock ?? 15;
    const stockMax = 30; 
    const stockPct = Math.min(100, Math.max(0, (stockCount / stockMax) * 100));
    let stockColor = "#10b981"; 
    let stockLabel = "In Stock";
    if (stockCount === 0) {
      stockColor = "#ef4444"; 
      stockLabel = "Out of Stock";
    } else if (stockCount <= 5) {
      stockColor = "#f43f5e"; 
      stockLabel = `Only ${stockCount} left`;
    } else if (stockCount <= 10) {
      stockColor = "#f59e0b"; 
      stockLabel = "Low Stock";
    }

    return (
      <div 
        className="relative h-full flex flex-col"
        style={{ zIndex: isHovered ? 50 : 1 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {index === 0 && <CardKeyframes />}

        <CinematicScrollReveal delay={0.05 * (index % 4)} className="h-full">
          <motion.div
            ref={cardRef}
            onClick={handleCardClick}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full cursor-pointer gpu-accel flex flex-col"
          >
            {/* ── Card shell ── */}
            <motion.div
              className="relative flex flex-col rounded-2xl overflow-hidden h-full z-10"
              animate={{
                boxShadow: isHovered
                  ? `0 12px 30px rgba(0,0,0,0.12), 0 0 0 1px ${t.borderLight}`
                  : `0 0 0 1px ${t.borderLight}`,
              }}
              transition={{ duration: 0.4 }}
              style={{ background: t.cardBg }}
            >
              {/* Animated prismatic top accent */}
              <motion.div
                aria-hidden
                className="absolute top-0 left-0 right-0 h-px z-20 gpu-accel"
                animate={{ opacity: isHovered ? 1 : 0.38 }}
                transition={{ duration: 0.35 }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #06b6d4, #3b82f6, #8b5cf6, transparent)",
                  animation: "pc-pulse-opacity 5s ease-in-out infinite",
                }}
              />

              {/* ══════════════ IMAGE SECTION ══════════════ */}
              <div className="relative overflow-hidden shrink-0" style={{ height: 264 }}>

                {/* SVG dot grid (Sharp and Clean) */}
                <svg
                  aria-hidden
                  className="absolute inset-0 w-[110%] h-[110%] left-[-5%] top-[-5%] opacity-[0.055] pointer-events-none z-0"
                >
                  <defs>
                    <pattern
                      id={`grid-card-${product.id}`}
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke={t.gridStroke}
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-card-${product.id})`} />
                </svg>

                <motion.div 
                  className="absolute inset-[-30px] flex items-center justify-center z-10 gpu-accel pointer-events-none" 
                  style={{ x: imgSX, y: imgSY }}
                >
                  <motion.img
                    src={product.images[0]}
                    alt={product.name}
                    className="object-contain pointer-events-auto select-none gpu-accel"
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      maxWidth: "270px", 
                      maxHeight: "270px", 
                      minWidth: "270px",
                      minHeight: "270px",
                    }}
                    animate={isHovered ? { scale: 1.025, y: -5 } : { scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget
                        .nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  {/* Fallback placeholder */}
                  <div
                    className="absolute inset-0 items-center justify-center flex-col gap-2 p-6"
                    style={{ display: "none" }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center opacity-30"
                      style={{ background: t.borderLight }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-8 h-8"
                        style={{ color: t.textSecondary }}
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                        <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span
                      className="text-[10px] font-medium text-center opacity-40"
                      style={{ color: t.textSecondary }}
                    >
                      {product.name}
                    </span>
                  </div>
                </motion.div>

                {/* Badges */}
                {product.badge && (
                  <div className="absolute top-3 left-3 z-20">
                    <BadgePill type={product.badge} />
                  </div>
                )}
                {discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35, ease: "backOut" }}
                    className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full gpu-accel"
                    style={{
                      background: t.badgeBg,
                      border: `1px solid ${t.badgeBorder}`,
                    }}
                  >
                    <span
                      className="pc-bebas text-[13px] leading-none"
                      style={{ color: t.orangeText }}
                    >
                      -{discount}%
                    </span>
                  </motion.div>
                )}

                {/* Action buttons (hover reveal) */}
                <motion.div
                  className="absolute bottom-3 right-3 z-30 flex flex-col gap-2 gpu-accel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={
                    isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                  }
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Wishlist */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onWishlist) {
                        onWishlist(product);
                      } else {
                        toggleWish(product.id);
                      }
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors duration-300 gpu-accel"
                    style={{
                      background:  t.cardBg,
                      borderColor: isWished ? "#ef4444" : t.borderLight,
                      color:       isWished ? "#ef4444" : t.textSecondary,
                    }}
                  >
                    <motion.div
                      animate={isWished ? { scale: [1, 1.45, 1] } : {}}
                      transition={{ duration: 0.35 }}
                    >
                      <FontAwesomeIcon
                        icon={isWished ? faHeart : faHeartOutline}
                        className="text-sm"
                      />
                    </motion.div>
                  </motion.button>

                  {/* Quick view */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickView?.(product);
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors duration-300 gpu-accel"
                    style={{
                      background:  t.cardBg,
                      borderColor: t.borderLight,
                      color:       t.textSecondary,
                    }}
                  >
                    <FontAwesomeIcon icon={faEye} className="text-sm" />
                  </motion.button>

                  {/* Compare */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCompare) {
                        onCompare(product);
                      } else {
                        storeToggleCompare(product.id);
                      }
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 gpu-accel"
                    style={{
                      background:  t.cardBg,
                      borderColor: isCompared ? "#8b5cf6" : t.borderLight,
                      color:       isCompared ? "#8b5cf6" : t.textSecondary,
                    }}
                  >
                    <FontAwesomeIcon icon={faCodeCompare} className="text-sm" />
                  </motion.button>
                </motion.div>

                {/* SpecRings (revealed at bottom of image on hover) */}
                <AnimatePresence>
                  {isHovered && ringSpecs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute bottom-0 left-0 right-0 z-25 flex items-end justify-center gap-5 pb-2.5 px-3 gpu-accel"
                      style={{
                        background: `linear-gradient(to top, ${
                          isDark
                            ? "rgba(0,0,0,0.72)"
                            : "rgba(240,240,240,0.78)"
                        } 0%, transparent 100%)`,
                      }}
                    >
                      {ringSpecs.map((spec, i) => (
                        <SpecRing
                          key={spec.label}
                          spec={spec}
                          pct={RING_PCTS[i] ?? 80}
                          orbKey={ORB_KEYS[i % ORB_KEYS.length]}
                          delay={i * 0.06}
                          visible={isHovered}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ══════════════ INFO SECTION ══════════════ */}
              <div className="flex flex-col flex-1 gap-3 p-4 pt-3.5 relative z-30">

                {/* Brand + Category */}
                <div className="flex items-center justify-between">
                  <motion.div
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full gpu-accel"
                    style={{
                      background: t.brandBg,
                      border: `1px solid ${t.brandBorder}`,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span
                      className="pc-space text-[9px] font-bold uppercase tracking-[0.15em]"
                      style={{ color: t.brandText }}
                    >
                      {product.brand}
                    </span>
                  </motion.div>
                  <span
                    className="pc-space text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: t.textSubtle }}
                  >
                    {product.category}
                  </span>
                </div>

                {/* Name + Tagline */}
                <div>
                  <h3
                    className="pc-space text-[17px] font-bold leading-tight tracking-tight mb-1 line-clamp-2"
                    style={{ color: t.text }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className="pc-outfit text-[13px] leading-relaxed line-clamp-1 opacity-70"
                    style={{ color: t.textSecondary }}
                  >
                    {product.tagline}
                  </p>
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <span
                    className="pc-bebas text-[16px] leading-none mt-0.5"
                    style={{ color: t.text }}
                  >
                    {product.rating.toFixed(1)}
                  </span>
                  <span
                    className="pc-outfit text-[11px] font-medium opacity-60"
                    style={{ color: t.textSubtle }}
                  >
                    ({product.reviewCount.toLocaleString()})
                  </span>
                  <div className="flex items-center gap-1 ml-auto shrink-0">
                    <FontAwesomeIcon
                      icon={faChartBar}
                      className="text-[9px]"
                      style={{ color: t.accentText }}
                    />
                    <span
                      className="pc-space text-[9px] font-bold uppercase tracking-wide"
                      style={{ color: t.accentText }}
                    >
                      {Math.round((product.rating / 5) * 100)}% positive
                    </span>
                  </div>
                </div>

                {/* Color variants */}
                {product.colorVariants && product.colorVariants.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className="pc-space text-[10px] font-bold uppercase tracking-wider opacity-60"
                      style={{ color: t.text }}
                    >
                      Color:
                    </span>
                    <span
                      className="pc-space text-[10px] font-bold"
                      style={{ color: t.text }}
                    >
                      {selectedColor?.name}
                    </span>
                    <div className="flex items-center gap-1.5 ml-1">
                      {product.colorVariants.map((cv) => (
                        <motion.button
                          key={cv.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedColor(cv);
                          }}
                          whileHover={{ scale: 1.28 }}
                          whileTap={{ scale: 0.88 }}
                          className="relative w-4 h-4 rounded-full border-2 transition-all duration-200 gpu-accel"
                          style={{
                            background:  cv.hex,
                            borderColor:
                              selectedColor?.name === cv.name
                                ? t.accentText
                                : "transparent",
                          }}
                          title={cv.name}
                        >
                          {selectedColor?.name === cv.name && (
                            <motion.div
                              layoutId={`color-ring-${product.id}`}
                              className="absolute -inset-0.5 rounded-full border gpu-accel"
                              style={{ borderColor: t.accentText }}
                              transition={{
                                type: "spring",
                                stiffness: 320,
                                damping: 24,
                              }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* شريط المخزون المدمج المخصص */}
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  <div className="flex justify-between items-center text-[10px] pc-space font-bold uppercase tracking-wider">
                    <span style={{ color: t.textSecondary }}>Availability</span>
                    <span style={{ color: stockColor }}>{stockLabel}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: t.borderLight }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stockPct}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: stockColor }}
                    />
                  </div>
                </div>

                <div className="h-px my-0.5" style={{ background: t.borderLight }} />

                {/* ══════════════ PRICE BLOCK ══════════════ */}
                <div className="mt-auto flex flex-col gap-3 pt-2">
                  <div className="flex flex-col rounded-xl p-3 border gpu-accel" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: t.borderLight }}>
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="pc-space text-[10px] font-bold uppercase tracking-[0.2em] opacity-60" style={{ color: t.text }}>Total Price</span>
                      {discount > 0 && (
                        <span className="pc-space text-[10px] font-bold px-1.5 py-0.5 rounded leading-none" style={{ color: "#34d399", background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.2)" }}>
                          SAVE {discount}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-end gap-2.5 mt-0.5">
                      <span className="pc-bebas text-[32px] leading-none tracking-wide" style={{ color: t.text }}>{formattedPrice}</span>
                      {formattedOriginal && (
                        <span className="pc-outfit text-[13px] font-medium line-through mb-1 opacity-40" style={{ color: t.text }}>{formattedOriginal}</span>
                      )}
                    </div>
                  </div>

                  {/* ══════════════ ACTIONS (BUY NOW + CART ICON) ══════════════ */}
                  <div className="flex items-center gap-2 w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleBuyNowClick}
                      className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 border-0 gpu-accel overflow-hidden relative group"
                      style={{ 
                        background: isDark ? "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)" : "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)",
                        color: "#fff"
                      }}
                    >
                      <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none gpu-accel" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)", transform: "skewX(-20deg) translateX(-150%)", animation: isHovered ? "pc-shimmer-sweep 3s infinite" : "none" }} />
                      <FontAwesomeIcon icon={faBolt} className="text-[13px]" />
                      <span className="pc-space font-bold text-[14px] uppercase tracking-wider mt-0.5">Buy Now</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCartClick}
                      className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border transition-colors duration-300 gpu-accel"
                      style={{
                        background: isCartAdded ? "#10b981" : t.cardBg,
                        borderColor: isCartAdded ? "#10b981" : t.borderLight,
                        color: isCartAdded ? "#fff" : t.text,
                        animation: isCartAdded ? "pc-cart-success 0.4s ease-out" : "none"
                      }}
                      title="Add to Cart"
                    >
                      <AnimatePresence mode="wait">
                        {isCartAdded ? (
                          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                            <FontAwesomeIcon icon={faCheck} className="text-[15px]" />
                          </motion.div>
                        ) : (
                          <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                            <FontAwesomeIcon icon={faCartShopping} className="text-[15px]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>

                {/* View details */}
                <motion.button
                  className="group relative inline-flex items-center gap-2 py-1 text-[11px] font-bold self-start transition-colors duration-300 pc-space gpu-accel mt-1"
                  style={{ color: t.textSubtle }}
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.25 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/product/${encodeURIComponent(product.id)}`);
                  }}
                >
                  <span
                    className="absolute left-0 -bottom-0.5 w-0 h-px rounded-full transition-all duration-300 group-hover:w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #06b6d4, #3b82f6)",
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="text-[9px] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  />
                  View Full Details
                </motion.button>
              </div>
            </motion.div>

            {/* ══ HUD Badges (hover reveal, left + right) ══ */}
            {leftSpecs.map((spec, i) => (
              <HudBadge
                key={spec.label}
                spec={spec}
                visible={isHovered}
                side="left"
                offsetY={i === 0 ? "84px" : "156px"}
                delay={i * 0.07}
              />
            ))}
            {rightSpecs.map((spec, i) => (
              <HudBadge
                key={spec.label}
                spec={spec}
                visible={isHovered}
                side="right"
                offsetY={i === 0 ? "84px" : "156px"}
                delay={0.1 + i * 0.07}
              />
            ))}
          </motion.div>
        </CinematicScrollReveal>
      </div>
    );
  }
);

export default ProductCard;