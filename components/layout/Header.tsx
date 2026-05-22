// components/layout/Header.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faHeart,
  faMagnifyingGlass,
  faUser,
  faBars,
  faXmark,
  faChevronDown,
  faArrowRight,
  faSun,
  faMoon,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { useTheme, useCart, useWishlist } from "@/store/useAppStore";
import { Logo } from "@/components/ui/Logo";
import { AccentLine } from "@/components/ui/AccentLine";

// استدعاء الأكشنز لقراءة البيانات حياً من السيرفر
import { fetchLaptopsAction, fetchHardwareAction } from "@/app/actions/products";
import LAPTOPS_FALLBACK from "@/data/laptops.json";
import HARDWARE_FALLBACK from "@/data/hardware.json";

/* ─── Constants ─────────────────────────────────────────────────── */
const CART_PULSE_DELAY_MS = 1800;
const SCROLL_THRESHOLD_PX = 30;
const CINEMATIC_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── Types / Data ───────────────────────────────────────────────── */
interface NavSubItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path?: string;
  sub?: NavSubItem[];
}

const NAV: NavItem[] = [
  { label: "Home", path: "/" },
  { 
    label: "Laptops", 
    sub: [
      { label: "Gaming", path: "/gaming" }, 
      { label: "Business", path: "/business" }, 
      { label: "Ultrabooks", path: "/ultrabooks" }, 
      { label: "2-in-1", path: "/2-in-1" } 
    ] 
  },
  { 
    label: "Brands", 
    sub: [
      { label: "Apple", path: "/brands/apple" }, 
      { label: "ASUS", path: "/brands/asus" }, 
      { label: "Dell", path: "/brands/dell" }, 
      { label: "HP", path: "/brands/hp" }, 
      { label: "Lenovo", path: "/brands/lenovo" }, 
      { label: "MSI", path: "/brands/msi" }, 
      { label: "Razer", path: "/brands/razer" }, 
      { label: "Samsung", path: "/brands/samsung" } 
    ] 
  },
  { 
    label: "PC", 
    sub: [
      { label: "CPU", path: "/pc/cpu" }, 
      { label: "GPU", path: "/pc/gpu" }, 
      { label: "Motherboards", path: "/pc/motherboards" }, 
      { label: "RAM", path: "/pc/ram" }, 
      { label: "Case", path: "/pc/case" }, 
      { label: "Monitors", path: "/pc/monitors" }, 
      { label: "SSD", path: "/pc/ssd" }, 
      { label: "NVMe", path: "/pc/nvme" }, 
      { label: "HDD", path: "/pc/hdd" } 
    ] 
  },
  { 
    label: "Accessories", 
    sub: [
      { label: "Mouse", path: "/shop" }, 
      { label: "Keyboards", path: "/shop" }, 
      { label: "Chargers", path: "/shop" }, 
      { label: "Fans", path: "/shop" } 
    ] 
  },
  { label: "Support", path: "/support" },
];

const TRENDING   = ["RTX 5090", "MacBook Pro M4", "Gaming Laptop", "MSI Titan", "ASUS ROG", "Ryzen 9"];
const CATEGORIES = ["CPU", "GPU", "Monitors", "Mechanical Keyboards", "NVMe SSD"];

/* ─── Desktop Dropdown — Floating Solid (No Blur) ──────────────────────────── */
function NavDropdown({ items }: { items: NavSubItem[] }) {
  const { t, isDark } = useTheme();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: CINEMATIC_EASE }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 min-w-50 rounded-2xl overflow-hidden p-2 z-50 shadow-2xl"
      style={{
        background: isDark ? "rgba(10, 15, 30, 0.98)" : "rgba(255, 255, 255, 0.98)",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : `1px solid rgba(0,0,0,0.08)`,
      }}
    >
      {items.map((item, i) => (
        <motion.button
          key={item.label}
          onClick={() => router.push(item.path)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1,  x: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3, ease: CINEMATIC_EASE }}
          className="bf w-full text-left px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors duration-200 group relative overflow-hidden"
          style={{ color: isDark ? "rgba(255,255,255,0.8)" : t.dropdownText }}
        >
          <span
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.05) 100%)"
                : "linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(37,99,235,0.05) 100%)",
            }}
          />
          <span className="relative z-10 flex items-center justify-between">
            {item.label}
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ─── Cinematic Search Showcase (No Blur) ──────────────────────────────────── */
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { isDark, t } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // حوامل بيانات البحث الحية (Live Databases)
  const [liveLaptops, setLiveLaptops] = useState<any[]>([]);
  const [liveHardware, setLiveHardware] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  // جلب البيانات الحية بمجرد تشغيل نافذة البحث
  useEffect(() => {
    async function loadSearchDatabase() {
      setFetching(true);
      try {
        const [laptops, hardware] = await Promise.all([
          fetchLaptopsAction(),
          fetchHardwareAction()
        ]);
        setLiveLaptops(laptops);
        setLiveHardware(hardware);
      } catch (err) {
        console.error("Search failed live DB, falling back to local files:", err);
        // Fallback الآمن لملفات الـ JSON المحلية في حال حدوث أي خطأ في الاتصال
        setLiveLaptops(LAPTOPS_FALLBACK);
        setLiveHardware(HARDWARE_FALLBACK);
      } finally {
        setFetching(false);
      }
    }
    loadSearchDatabase();
  }, []);

  // إجراء تصفية وبحث حي متجاوب ومباشر
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const terms = query.toLowerCase().split(' ').filter(Boolean);
    
    const resLaptops = liveLaptops.filter(l => 
      terms.every(term => 
        l.name?.toLowerCase().includes(term) || 
        l.brand?.toLowerCase().includes(term) ||
        l.category?.toLowerCase().includes(term) ||
        l.tagline?.toLowerCase().includes(term)
      )
    ).map(l => ({ ...l, type: 'laptop' }));

    const resHardware = liveHardware.filter(h => 
      terms.every(term =>
        h.name?.toLowerCase().includes(term) || 
        h.brand?.toLowerCase().includes(term) ||
        h.category?.toLowerCase().includes(term) ||
        h.description?.toLowerCase().includes(term)
      )
    ).map(h => ({ ...h, type: 'hardware' }));

    setResults([...resLaptops, ...resHardware].slice(0, 6));
  }, [query, liveLaptops, liveHardware]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <>
      {/* Background Mask */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        role="button"
        tabIndex={0}
        aria-label="Close search"
        className="absolute top-0 left-0 w-screen h-dvh z-[999] cursor-default"
        style={{
          background: isDark ? "rgba(2, 6, 15, 0.85)" : "rgba(245, 245, 245, 0.85)", 
        }}
      />

      {/* Floating Search Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
        className="absolute top-full left-0 right-0 z-[1000] mx-auto w-full max-w-5xl px-3 sm:px-4 lg:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="mt-4 rounded-[2.5rem] overflow-hidden border shadow-2xl max-h-[85vh] flex flex-col"
          style={{
            background: isDark ? "rgba(3, 7, 18, 0.98)" : "rgba(255, 255, 255, 0.98)", 
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          }}
        >
          <div className="p-4 sm:p-6 lg:p-10 overflow-y-auto">
            <div className="relative group">
              <label htmlFor="site-search" className="sr-only">Search products</label>
              <FontAwesomeIcon 
                icon={faMagnifyingGlass} 
                aria-hidden="true"
                className="absolute left-1 top-1/2 -translate-y-1/2 text-xl sm:text-2xl lg:text-3xl transition-colors duration-300"
                style={{ color: query ? (isDark ? "#06b6d4" : "#0ea5e9") : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)") }}
              />
              <input
                ref={inputRef}
                id="site-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the future..."
                aria-label="Search products"
                autoComplete="off"
                className="bf w-full bg-transparent text-xl sm:text-2xl lg:text-4xl font-medium outline-none pl-10 sm:pl-12 lg:pl-16 pr-12 py-2"
                style={{ color: isDark ? "#fff" : "#000" }}
              />
              
              <AnimatePresence>
                {(query || fetching) && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { if (!fetching) setQuery(""); }}
                    aria-label="Clear search"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                      color: isDark ? "#fff" : "#000"
                    }}
                  >
                    <FontAwesomeIcon icon={fetching ? faSpinner : faXmark} className={fetching ? "animate-spin text-sm" : "text-lg"} />
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                <motion.div
                  className="absolute left-0 top-0 bottom-0 origin-left h-px"
                  animate={{ scaleX: query ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
                  style={{
                    width: '100%',
                    background: isDark ? "linear-gradient(90deg, #06b6d4, #3b82f6)" : "linear-gradient(90deg, #0ea5e9, #2563eb)",
                    boxShadow: isDark ? "0 0 15px rgba(6,182,212,0.5)" : "0 0 10px rgba(14,165,233,0.3)"
                  }}
                />
              </div>
            </div>

            <div className="mt-6 sm:mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {/* Results Section */}
              <div className="md:col-span-1 lg:col-span-2">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bf text-[10px] font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-3 opacity-40"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  {query.length > 1 ? `Results (${results.length})` : "Trending Terms"}
                  <span className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
                </motion.h3>

                <div className="flex flex-col gap-2">
                  <AnimatePresence mode="popLayout">
                    {results.length > 0 ? (
                      results.map((item, i) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 5 }}
                          transition={{ duration: 0.3, delay: i * 0.03 }}
                          whileHover={{ scale: 1.01, x: 5 }}
                          onClick={() => {
                            router.push(item.type === 'laptop' ? `/product/${item.id}` : `/hardware/${item.id}`);
                            onClose();
                          }}
                          className="bf group flex items-center gap-4 p-2.5 rounded-2xl transition-all duration-300 relative overflow-hidden"
                          style={{
                            background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)",
                            border: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.02)",
                            color: isDark ? "#fff" : "#000"
                          }}
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                            <img 
                              src={item.type === 'laptop' ? item.image : (item.images?.[0] || item.image)} 
                              alt={item.name} 
                              className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500" 
                            />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-500">
                                {item.brand}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm truncate" style={{ color: t.text }}>{item.name}</h4>
                            <p className="text-[11px] opacity-40 truncate" style={{ color: t.textSecondary }}>{item.tagline || item.description}</p>
                          </div>
                          <div className="text-right shrink-0 pr-2">
                            <div className="font-bold text-sm text-cyan-500">${item.price}</div>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      query.length > 1 ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-12 text-center opacity-30 italic text-sm"
                          style={{ color: t.textSecondary }}
                        >
                          No matches for "{query}"
                        </motion.div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {TRENDING.map((term, i) => (
                            <motion.button
                              key={term}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => { setQuery(term); }}
                              className="bf text-left p-3.5 rounded-xl flex items-center justify-between group transition-colors"
                              style={{ 
                                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                                border: isDark ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.02)"
                              }}
                            >
                              <span className="text-xs opacity-60 group-hover:opacity-100 group-hover:text-cyan-500 transition-all" style={{ color: t.text }}>{term}</span>
                              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[9px] opacity-20" />
                            </motion.button>
                          ))}
                        </div>
                      )
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Categories Section */}
              <div className="hidden md:block space-y-8">
                <div>
                  <motion.h3
                    className="bf text-[10px] font-bold tracking-[0.2em] uppercase mb-6 opacity-40"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    Quick Filter
                  </motion.h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <motion.button
                        key={c}
                        whileHover={{ scale: 1.05, y: -2 }}
                        onClick={() => setQuery(c)}
                        className="bf px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                          border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)",
                          color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                        }}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Mobile Nav Item ────────────────────────────────────────────── */
function MobileNavItem({
  item,
  active,
  onSelect,
}: {
  item:     NavItem;
  active:   boolean;
  onSelect: (path: string) => void;
}) {
  const { t, isDark } = useTheme();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <motion.button
        onClick={() => {
          if (item.sub) setOpen((s) => !s);
          else if (item.path) onSelect(item.path);
        }}
        whileTap={{ scale: 0.98 }}
        className="bf w-full flex items-center justify-between px-4 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-medium transition-all duration-300 relative group overflow-hidden"
        style={{ color: active && !item.sub ? (isDark ? "#06b6d4" : "#0ea5e9") : t.navText }}
      >
        <span
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
        />
        <span className="relative z-10">{item.label}</span>
        {item.sub && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
            className="relative z-10"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
          >
            <FontAwesomeIcon icon={faChevronDown} className="text-sm" />
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence initial={false}>
        {item.sub && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-2 mb-2 flex flex-col gap-1 border-l-2 pl-4" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              {item.sub.map((sub, idx) => (
                <motion.button
                  key={sub.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3, ease: CINEMATIC_EASE }}
                  onClick={() => onSelect(sub.path)}
                  className="bf text-left px-4 py-3 rounded-xl text-base transition-colors duration-300"
                  style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
                  whileHover={{ color: isDark ? "#fff" : "#000", x: 5 }}
                >
                  {sub.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Magnetic ActionBtn — Smooth Soft Aura ──────────────────────── */
function ActionBtn({
  children,
  onClick,
  aria,
  hoverColor = "white",
}: {
  children:    React.ReactNode;
  onClick?:    () => void;
  aria?:       string;
  hoverColor?: "cyan" | "pink" | "white";
}) {
  const { t, isDark } = useTheme();
  const btnRef = useRef<HTMLButtonElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 300, damping: 30, mass: 0.5 });
  const springY = useSpring(rawY, { stiffness: 300, damping: 30, mass: 0.5 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set((e.clientX - (rect.left + rect.width  / 2)) * 0.3);
      rawY.set((e.clientY - (rect.top  + rect.height / 2)) * 0.3);
    },
    [rawX, rawY]
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const glowColor =
    hoverColor === "cyan"  ? (isDark ? "rgba(6,182,212,1)" : "rgba(14,165,233,1)")
    : hoverColor === "pink" ? "rgba(236,72,153,1)"
    : isDark               ? "rgba(255,255,255,1)"
    :                        "rgba(0,0,0,0.5)";

  return (
    <motion.button
      ref={btnRef}
      style={{ x: springX, y: springY, color: isDark ? "#fff" : t.iconText }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      aria-label={aria}
      className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 group overflow-hidden bg-transparent"
    >
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}30 0%, transparent 60%)`,
        }}
      />
      <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{children}</span>
    </motion.button>
  );
}

/* ─── Badge ──────────────────────────────────────────────────────── */
function Badge({ count, color }: { count: number; color: string }) {
  const { t } = useTheme();
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className={`absolute top-0 right-0 min-w-4.5 h-4.5 px-1 ${color} rounded-full hf
                  text-[10px] text-white flex items-center justify-center font-bold leading-none`}
      style={{ boxShadow: `0 0 0 3px ${t.bg}` }}
    >
      {count}
    </motion.span>
  );
}

/* ─── Main Header ────────────────────────────────────────────────── */
export default function Header() {
  const router = useRouter();
  const [scrolled,    setScrolled]   = useState<boolean>(false);
  const [searchOpen,  setSearchOpen] = useState<boolean>(false);
  const [mobileOpen,  setMobileOpen] = useState<boolean>(false);
  const [activeNav,   setActiveNav]  = useState<string>("Home");
  const [openDrop,    setOpenDrop]   = useState<string | null>(null);
  const [cartPulse,   setCartPulse]  = useState<boolean>(false);
  const [hoveredNav,  setHoveredNav] = useState<string | null>(null);
  const [hidden, setHidden] = useState<boolean>(false);
  const lastScrollY = useRef(0);

  const { t, isDark, toggleTheme } = useTheme();
  const { cartCount }               = useCart();
  const { wishCount }               = useWishlist();

  const navRef = useRef<HTMLElement>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > SCROLL_THRESHOLD_PX);
    if (!searchOpen && !mobileOpen) {
      setHidden(v > lastScrollY.current && v > 80);
    }
    lastScrollY.current = v;
  });

  useEffect(() => {
    if (searchOpen || mobileOpen) setHidden(false);
  }, [searchOpen, mobileOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setCartPulse(true), CART_PULSE_DELAY_MS);
    return () => clearTimeout(timer);
  },[]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDrop(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  },[]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  },[]);

  const handleNavSelect = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  const headerBg = isDark
    ? scrolled ? "rgba(3, 7, 18, 0.98)"  : "rgba(3, 7, 18, 0.85)"
    : scrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.85)";

  const borderBottom = isDark
    ? scrolled ? "1px solid rgba(6,182,212,0.2)" : "1px solid rgba(255,255,255,0.03)"
    : scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent";
    
  const borderGlow = isDark && scrolled
    ? "0 4px 30px rgba(6,182,212,0.1)"
    : scrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none";

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 z-[99]"
        style={{
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <header
          className={`relative z-20 transition-all duration-500 ease-out`}
          style={{
            background: headerBg,
            borderBottom: borderBottom,
            boxShadow: borderGlow,
          }}
        >
          <AccentLine duration={4} />

          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 sm:h-20 lg:h-24 flex items-center justify-between gap-2 sm:gap-4">
            <motion.a
              href="/"
              aria-label="Go to homepage"
              className="hf flex items-center gap-3 shrink-0 select-none z-10 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: CINEMATIC_EASE }}
            >
              <Logo variant="responsive" />
            </motion.a>

            <div className="flex-1 flex justify-center items-center">
              <motion.nav
                ref={navRef}
                aria-label="Main navigation"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden lg:flex items-center gap-0.5 lg:gap-2 xl:gap-4 justify-center"
                onMouseLeave={() => setHoveredNav(null)}
              >
                {NAV.map((item) => (
                  <motion.div
                    key={item.label}
                    className="relative shrink-0"
                    onHoverStart={() => setHoveredNav(item.label)}
                  >
                    <motion.button
                      onClick={() => {
                        setActiveNav(item.label);
                        if (item.path) router.push(item.path);
                        if (item.sub) setOpenDrop((prev) => (prev === item.label ? null : item.label));
                      }}
                      aria-haspopup={item.sub ? "true" : undefined}
                      aria-expanded={item.sub ? openDrop === item.label : undefined}
                      className="bf relative px-2 py-2 md:px-3 lg:px-4 lg:py-2.5 rounded-full text-xs lg:text-sm font-medium transition-colors duration-300 group"
                      style={{
                        color: activeNav === item.label ? (isDark ? "#fff" : "#000") : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"),
                      }}
                    >
                      <AnimatePresence>
                        {hoveredNav === item.label && (
                          <motion.span
                            layoutId="navHoverBg"
                            className="absolute inset-0 rounded-full pointer-events-none"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                          />
                        )}
                      </AnimatePresence>

                      <span className="relative z-10 flex items-center gap-1.5">
                        {item.label}
                        {item.sub && <FontAwesomeIcon icon={faChevronDown} className="text-[10px] opacity-50 transition-transform duration-300" style={{ transform: openDrop === item.label ? "rotate(180deg)" : "none" }} />}
                      </span>

                      {activeNav === item.label && (
                        <motion.div
                          layoutId="navLine"
                          className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full z-20"
                          style={{
                            background: isDark
                              ? "linear-gradient(90deg, transparent 0%, #60a5fa 50%, transparent 100%)"
                              : "linear-gradient(90deg, transparent 0%, #1d4ed8 50%, transparent 100%)",
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {item.sub && openDrop === item.label && (
                        <NavDropdown items={item.sub} />
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.nav>
            </div>

            <motion.div
              className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 shrink-0 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: CINEMATIC_EASE }}
            >
              <ActionBtn 
                onClick={() => {
                  setSearchOpen((s) => !s);
                  if (mobileOpen) setMobileOpen(false);
                }} 
                aria="Search" 
                hoverColor="cyan"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={searchOpen ? "x" : "search"}
                    initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.3, ease: CINEMATIC_EASE }}
                  >
                    <FontAwesomeIcon icon={searchOpen ? faXmark : faMagnifyingGlass} className="text-[15px]" />
                  </motion.span>
                </AnimatePresence>
              </ActionBtn>

              <ActionBtn onClick={toggleTheme} aria="Toggle theme" hoverColor="cyan">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isDark ? "moon" : "sun"}
                    initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.3, ease: CINEMATIC_EASE }}
                  >
                    <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="text-[15px]" />
                  </motion.span>
                </AnimatePresence>
              </ActionBtn>

                            <div className="hidden lg:block">
                <ActionBtn aria="Login" hoverColor="white" onClick={() => router.push("/login")}>
                  <FontAwesomeIcon icon={faUser} className="text-[15px]" />
                </ActionBtn>
              </div>

              <div className="hidden lg:block">
                <ActionBtn aria="Profile" hoverColor="white" onClick={() => router.push("/profile")}>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">P</span>
                </ActionBtn>
              </div>

              <div className="relative hidden lg:block">
                <ActionBtn aria="Wishlist" hoverColor="pink" onClick={() => router.push("/wishlist")}>
                  <FontAwesomeIcon icon={faHeart} className="text-[15px]" />
                </ActionBtn>
                {wishCount > 0 && <Badge count={wishCount} color="bg-pink-500" />}
              </div>

              <motion.button
                onClick={() => router.push("/cart")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Shopping cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
                animate={cartPulse ? { scale: [1, 1.15, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] } : {}}
                transition={{ duration: 0.5, ease: CINEMATIC_EASE }}
                onAnimationComplete={() => setCartPulse(false)}
                className="hf relative flex items-center gap-1.5 h-9 sm:h-10 lg:h-11 px-3 sm:px-4 lg:px-5 ml-1 rounded-full text-sm font-semibold text-white overflow-hidden shadow-2xl"
                style={{
                  background: isDark ? "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)" : "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                  boxShadow: isDark ? "0 10px 30px -10px rgba(6,182,212,0.8)" : "0 10px 30px -10px rgba(14,165,233,0.6)",
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20 -skew-x-12"
                  initial={{ x: "-150%" }}
                  animate={{ x: "250%" }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                />
                <FontAwesomeIcon icon={faCartShopping} className="relative z-10 text-[15px]" />
                <span className="hidden sm:inline relative z-10 tracking-wide">Cart</span>
                <motion.span
                  key={cartCount}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10 min-w-5.5 h-5.5 px-1.5 rounded-full bg-white/25 flex items-center justify-center text-[11px] font-bold"
                >
                  {cartCount}
                </motion.span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { 
                  setMobileOpen((s) => !s); 
                  if (searchOpen) setSearchOpen(false); 
                }}
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-menu"
                className="lg:hidden w-10 h-10 ml-1 rounded-full flex items-center justify-center transition-colors duration-300"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  color: isDark ? "#fff" : "#000",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "x" : "bars"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: CINEMATIC_EASE }}
                  >
                    <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} className="text-base" />
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </div>
        </header>

        {/* Global Search Overlay Mounted Here */}
        <AnimatePresence>
          {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-nav-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
              className="lg:hidden absolute top-full left-0 right-0 z-30 max-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-5.5rem)] overflow-y-auto"
              role="navigation"
              aria-label="Mobile navigation"
              style={{
                background: isDark ? "rgba(3, 7, 18, 0.98)" : "rgba(255, 255, 255, 0.98)", 
                borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)"
              }}
            >
              <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: CINEMATIC_EASE }}
                  >
                    <MobileNavItem item={item} active={activeNav === item.label} onSelect={handleNavSelect} />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: CINEMATIC_EASE }}
                  className="my-4 h-px origin-left"
                  style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                />

                <div className="flex gap-4">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4, ease: CINEMATIC_EASE }}
                    className="flex-1 bf flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-medium transition-colors"
                    style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", color: isDark ? "#fff" : "#000" }}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    Account
                  </motion.button>
                  <motion.button
                    onClick={()=>{router.push("/wishlist")}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4, ease: CINEMATIC_EASE }}
                    className="flex-1 bf relative flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-medium transition-colors"
                    style={{ background: isDark ? "rgba(236,72,153,0.1)" : "rgba(236,72,153,0.05)", color: isDark ? "#f472b6" : "#db2777" }}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    Wishlist
                    {wishCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}