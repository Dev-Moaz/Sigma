// app/(main)/wishlist/page.tsx
"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
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
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme, useWishlist, useCart } from "@/store/useAppStore";
import ProductCard from "@/components/ui/ProductCard";
import HardwareProductCard from "@/components/ui/HardwareProductCard";
import laptopsData from "@/data/laptops.json";
import hardwareData from "@/data/hardware.json";
import type { Product } from "@/lib/laptop-schema";
import type { HardwareProduct } from "@/lib/hardware-schema";

type UnifiedProduct = (Product & { _type: "laptop" }) | (HardwareProduct & { _type: "hardware" });

// ─── Constants ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Particles({ count = 20 }: { count?: number }) {
  const { theme } = useTheme();
  const particles = useRef(
    Array.from({ length: count }, () => ({
      size:        Math.random() * 2.5 + 0.5,
      xStart:      Math.random() * 100,
      delay:       Math.random() * 10,
      duration:    Math.random() * 10 + 16,
      opacityBase: Math.random() * 0.25 + 0.06,
      xEnd:        Math.random() * 40 - 20,
    }))
  ).current;

  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={
            {
              width:      p.size,
              height:     p.size,
              left:       `${p.xStart}%`,
              bottom:     "-4px",
              background: theme === "dark" ? "#ffffff" : "#000000",
              "--op":     p.opacityBase,
              "--tx":     `${p.xEnd}px`,
              animation:  `wl-float-up ${p.duration}s linear ${p.delay}s infinite`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

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

function CinematicScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 52 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  const { t, theme } = useTheme();

  return (
    <CinematicScrollReveal delay={0.2}>
      <div className="flex flex-col items-center justify-center py-32 gap-8">
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full blur-[40px]"
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

        <div className="text-center">
          <h3 className="hf text-3xl font-extrabold mb-3" style={{ color: t.text }}>
            Your Wishlist is Empty
          </h3>
          <p className="text-[15px] font-medium leading-relaxed max-w-sm" style={{ color: t.textSecondary }}>
            Start exploring and save the items you love — they'll show up right here.
          </p>
        </div>

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
          Browse Shop
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </motion.a>
      </div>
    </CinematicScrollReveal>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t, theme } = useTheme();

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    background: t.cardBg,
    border: `1px solid ${t.borderLight}`,
    color: t.textSecondary,
  };

  const btnActive: React.CSSProperties = {
    background: theme === "dark"
      ? "linear-gradient(135deg,#0ea5e9,#2563eb)"
      : "linear-gradient(135deg,#06b6d4,#2563eb)",
    border: "1px solid transparent",
    color: "#fff",
    boxShadow: "0 4px 16px rgba(6,182,212,0.30)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center gap-2 mt-12 flex-wrap"
    >
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        style={btnBase}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
      </motion.button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-sm font-bold"
            style={{ color: t.textSubtle }}
          >
            ···
          </span>
        ) : (
          <motion.button
            key={page}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onPageChange(page)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200"
            style={currentPage === page ? btnActive : btnBase}
          >
            {page}
          </motion.button>
        )
      )}

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        style={btnBase}
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
      </motion.button>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Wishlist() {
  const { theme, t } = useTheme();
  // لا نحتاج هنا لـ toggleWish لأن الـ ProductCard تستدعيها بنفسها مباشرة من الـ Store
  const { wishIds } = useWishlist();
  const { addToCart } = useCart();

  const [currentPage, setCurrentPage] = useState(1);

  const wishedProducts = useMemo(() => {
    const laptops = (laptopsData as Product[]).map(p => ({ ...p, _type: 'laptop' as const }));
    const hardware = (hardwareData as HardwareProduct[]).map(p => ({ ...p, _type: 'hardware' as const }));
    
    return [...laptops, ...hardware].filter((p) => wishIds.includes(p.id));
  }, [wishIds]);

  const totalPages = Math.ceil(wishedProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = wishedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [wishedProducts.length, totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
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
        <div
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            background: `radial-gradient(circle at center, transparent 30%, ${
              theme === "dark" ? "#000000e6" : "#00000040"
            } 110%)`,
            mixBlendMode: theme === "dark" ? "normal" : "multiply",
          }}
        />

        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          animate={{ scale: [1, 1.05] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        >
          <GridBg />
          <Particles count={20} />
        </motion.div>

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

        <motion.div
          className="absolute top-0 left-0 right-0 h-px z-20"
          style={{ background: "linear-gradient(90deg, transparent, #06b6d4, #3b82f6, #7c3aed, transparent)" }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, ${t.radialMask} 75%)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">

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
                      ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, wishedProducts.length)} of ${wishedProducts.length} items`
                      : "No saved items yet."}
                  </p>
                </div>

                <AnimatePresence>
                  {wishedProducts.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        wishedProducts.forEach((p) => {
                          const finalPrice = p._type === 'hardware' ? (p.discountPrice || p.price) : p.price;
                          const finalImage = p.images[0] || "";
                          addToCart({ id: p.id, name: p.name, price: finalPrice, image: finalImage }, 1);
                        });
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

              <div className="mt-8 h-px" style={{ background: t.borderLight }} />
            </div>
          </CinematicScrollReveal>

          <AnimatePresence mode="wait">
            {wishedProducts.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState />
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence>
                    {paginatedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout  
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      >
                        {product._type === 'laptop' ? (
                          <ProductCard
                            product={product as Product}
                            index={index}
                          />
                        ) : (
                          <HardwareProductCard
                            product={product as HardwareProduct}
                            index={index}
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </>
  );
}