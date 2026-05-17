// components/heroSection.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBolt,
  faShieldHalved,
  faTruck,
  faPhone,
  faStar,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/store/useAppStore";
import { Particles } from "@/components/ui/Particles";
import { CinematicReveal as CinematicScrollReveal } from "@/components/ui/CinematicReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

/* ─── Data ─────────────────────────────────────────── */
const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "2K+", label: "Products" },
  { value: "99%", label: "Satisfaction" },
  { value: "24/7", label: "Support" },
];

const TRUST_BADGES =[
  { icon: faTruck, label: "Free Shipping", sub: "Orders over $999", color: "#0ea5e9" },
  { icon: faShieldHalved, label: "2-Year Warranty", sub: "All products", color: "#10b981" },
  { icon: faPhone, label: "24/7 Support", sub: "Always here", color: "#8b5cf6" },
  { icon: faTag, label: "Best Price", sub: "Price match guarantee", color: "#f59e0b" },
];

const FEATURED_CHIPS = ["Gaming", "Ultrabooks", "Workstations", "2-in-1"];

const BRANDS = [
  "Apple", "ASUS ROG", "MSI", "Razer", "Dell XPS",
  "Lenovo", "HP Omen", "Samsung", "Acer Predator", "Gigabyte",
];

const MARQUEE_SET = [...BRANDS, ...BRANDS];

/* ─── Cards Data ─────────────────────────────────────── */
const SPEC_CARDS_DARK =[
  { id: 1, label: "GPU", value: "RTX 5090", color: "#76b900", delay: 0, position: { bottom: "28%", left: "4%" }, align: "left" },
  { id: 2, label: "CPU", value: "Ultra 9 285HX", color: "#0071c5", delay: 0.3, position: { bottom: "28%", right: "4%" }, align: "right" },
  { id: 3, label: "RAM", value: "64GB DDR5", color: "#8b5cf6", delay: 0.6, position: { top: "12%", left: "4%" }, align: "left" },
  { id: 4, label: "Storage", value: "4TB NVMe", color: "#06b6d4", delay: 0.9, position: { top: "12%", right: "4%" }, align: "right" },
];

const SPEC_CARDS_LIGHT =[
  { id: 1, label: "GPU", value: "RTX™ 5080", color: "#76b900", delay: 0, position: { bottom: "28%", left: "4%" }, align: "left" },
  { id: 2, label: "CPU", value: "Ryzen™ 9 HX", color: "#ef4444", delay: 0.3, position: { bottom: "28%", right: "4%" }, align: "right" },
  { id: 3, label: "Display", value: "3K OLED", color: "#8b5cf6", delay: 0.6, position: { top: "12%", left: "4%" }, align: "left" },
  { id: 4, label: "Refresh", value: "120Hz", color: "#06b6d4", delay: 0.9, position: { top: "12%", right: "4%" }, align: "right" },
];

const REVIEW_AVATARS = [
  { letter: "J", color: "#0ea5e9" },
  { letter: "M", color: "#7c3aed" },
  { letter: "A", color: "#06b6d4" },
  { letter: "K", color: "#3b82f6" },
];

/* ─── Typewriter ────────────────────────────────────── */
function TypewriterText({
  text, delay = 0, speed = 60, accentText,
}: {
  text: string; delay?: number; speed?: number; accentText?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(start);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(timer);
  }, [started, displayed, text, speed]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="inline-block w-0.5 h-[0.85em] rounded-sm ml-1 align-middle"
          style={{
            background: accentText || "linear-gradient(180deg,#06b6d4,#3b82f6)",
            boxShadow: `0 0 8px ${accentText || "#06b6d4"}`,
          }}
        />
      )}
    </span>
  );
}

/* ─── CountUp ───────────────────────────────────────── */
const COUNT_UP_DURATION = 1800;

function CountUp({ target }: { target: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  const match = target.match(/^([\d.]+)(.*)$/);
  const numeric = match ? parseFloat(match[1]) : NaN;
  const rest = match ? match[2] : target;

  useEffect(() => {
    if (!inView || isNaN(numeric)) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / COUNT_UP_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * numeric));
      if (progress < 1) requestAnimationFrame(step);
      else setVal(numeric);
    };
    requestAnimationFrame(step);
  }, [inView, numeric]);

  if (isNaN(numeric)) return <span ref={ref}>{target}</span>;

  return (
    <span ref={ref}>
      {Number.isInteger(numeric) ? val : val.toFixed(0)}
      {rest}
    </span>
  );
}

/* ─── Animated Grid Background with Parallax ────────── */
function GridBg({ parallaxX, parallaxY }: { parallaxX: any; parallaxY: any }) {
  const { t } = useTheme();
  return (
    <motion.div className="absolute inset-0 overflow-hidden z-0 will-change-transform max-md:!transform-none" style={{ x: parallaxX, y: parallaxY }}>
      <svg aria-hidden="true" className="absolute inset-0 w-[110%] h-[110%] left-[5%] top-[5%] opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={t.gridStroke} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, ${t.radialMask} 75%)` }} />
    </motion.div>
  );
}

/* ─── Floating Spec Card (Tech HUD Design - Optimized) ───────────── */
function SpecCard({
  label, value, color, delay, style, align
}: {
  label: string; value: string; color: string; delay: number; style: React.CSSProperties; align: string;
}) {
  const { t } = useTheme();
  const baseRevealDelay = 0.2; 

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ delay: baseRevealDelay + delay * 0.2, duration: 0.8, ease: "easeOut" }}
      style={style}
      className="absolute z-20 cursor-pointer group hidden md:block" // تم الإخفاء في الجوال لتخفيف المعالجة
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
        className="relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-300"
        style={{
          background: t.bgSecondary,
          borderColor: `${color}40`,
          boxShadow: `0 0 20px ${color}10, inset 0 0 10px ${color}05`,
        }}
      >
        <div 
          className="absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
          style={{
            [align === "left" ? "left" : "right"]: "100%",
            flexDirection: align === "left" ? "row" : "row-reverse",
            width: 40
          }}
        >
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: baseRevealDelay + 0.3 + delay * 0.2, duration: 0.6, ease: "circOut" }}
            className="h-px w-full" 
            style={{ 
              background: `linear-gradient(to ${align === "left" ? "right" : "left"}, ${color}80, transparent)`,
              originX: align === "left" ? 0 : 1,
            }} 
          />
          <motion.div 
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: baseRevealDelay + 0.8 + delay * 0.2, duration: 0.4 }}
             className="w-1 h-1 rounded-full shadow-[0_0_8px] shrink-0" 
             style={{ background: color, color: color, boxShadow: `0 0 8px ${color}` }} 
          />
        </div>

        <div className="relative w-2 h-2 rounded-full shrink-0 group-hover:scale-150 transition-transform duration-300" style={{ background: color, boxShadow: `0 0 10px ${color}` }}>
          <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ background: color }} />
        </div>
        
        <div className="leading-tight">
          <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5 opacity-70 transition-colors duration-300" style={{ color: t.textSecondary }}>{label}</p>
          <p className="hf text-sm font-bold tracking-wide transition-colors duration-300" style={{ color: t.text }}>{value}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Laptop Image with Glowing Circle & Fake Shadow ─────────────────────── */
function LaptopImage({ parallaxX, parallaxY, rotateX, rotateY }: { parallaxX: any; parallaxY: any, rotateX: any, rotateY: any }) {
  const { theme, t } = useTheme();
  
  return (
    <motion.div
      style={{ 
        perspective: 1200, 
        x: parallaxX, 
        y: parallaxY,
        willChange: "transform" 
      }}
      className="relative w-full max-w-xl mx-auto z-10 flex justify-center items-center max-md:!transform-none"
    >
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square rounded-full -z-10 pointer-events-none"
        style={{
          background: theme === "dark" 
            ? `radial-gradient(circle closest-side, ${t.glowCyan}30 0%, ${t.glowPurple}15 50%, transparent 100%)` 
            : `radial-gradient(circle closest-side, #0ea5e91A 0%, #8b5cf60A 50%, transparent 100%)`
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0.3, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d", 
        }}
        // إلغاء تأثيرات التأخير والحركة في الهاتف لتظهر الصورة فوراً
        className="relative w-full max-md:!opacity-100 max-md:!transform-none"
      >
        <div 
          aria-hidden="true"
          className="absolute -bottom-6 left-[10%] right-[10%] h-16 -z-10"
          style={{
            background: theme === "dark"
              ? "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 75%)"
              : "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 40%, transparent 75%)"
          }}
        />

        <Image
          src={theme === "light" ? "/laptop-hero-light-theme.png" : "/laptop-hero-dark-theme.png"}
          alt="Elite Gaming Laptop"
          width={1000}
          height={814}
          priority={true}
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-auto object-contain select-none relative z-10"
          draggable={false}
          style={{ 
            transform: "translateZ(30px)" 
          }}
        />

        <motion.div
          className="absolute -bottom-8 left-[15%] right-[15%] h-12 -z-10 rounded-[100%]"
          style={{ 
            background: theme === "dark" 
              ? `radial-gradient(ellipse closest-side, ${t.glowCyan}60 0%, ${t.glowPurple}30 50%, transparent 100%)` 
              : `radial-gradient(ellipse closest-side, #06b6d440 0%, #8b5cf620 50%, transparent 100%)` 
          }}
          animate={{ opacity: [0.6, 0.9, 0.6], scaleX: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── Scroll Indicator ──────────────────────────────── */
function ScrollIndicator() {
  const { t } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 1 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 hidden md:flex"
    >
      <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: t.textSubtle }}>Scroll</p>
      <motion.div className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5" style={{ borderColor: t.border }}>
        <motion.div
          className="w-1 h-2 rounded-full"
          style={{ backgroundColor: t.accentText }}
          animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── Featured Brands Marquee ────────────────────────── */
function FeaturedBrands() {
  const { t } = useTheme();
  return (
    <div className="relative z-10 border-t overflow-hidden py-6" style={{ borderTopColor: t.borderLight }}>
      <p className="text-center text-[10px] font-semibold uppercase tracking-widest mb-5" style={{ color: t.textSubtle }}>Authorized Reseller — 20+ Leading Brands</p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10" style={{ background: `linear-gradient(90deg, ${t.bg}, transparent)` }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10" style={{ background: `linear-gradient(270deg, ${t.bg}, transparent)` }} />
        <motion.div className="flex w-max" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 45, ease: "linear", repeat: Infinity }}>
          {[0, 1].map((groupIdx) => (
            <div key={groupIdx} className="flex gap-4 pr-4">
              {MARQUEE_SET.map((brand, i) => (
                <motion.div key={`${brand}-${i}`} whileHover={{ scale: 1.06, borderColor: t.accentBadgeBorder }} className="shrink-0 px-6 py-2.5 rounded-xl cursor-pointer transition-colors duration-200 text-sm font-semibold" style={{ background: t.brandBg, border: `1px solid ${t.brandBorder}`, color: t.brandText }}>{brand}</motion.div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 40, damping: 20, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const bgX = useTransform(springX, [-500, 500], [15, -15]);
  const bgY = useTransform(springY, [-500, 500], [15, -15]);
  const laptopX = useTransform(springX, [-500, 500], [-15, 15]);
  const laptopY = useTransform(springY, [-500, 500], [-15, 15]);
  
  const laptopRotateX = useTransform(springY, [-500, 500], [6, -6]);
  const laptopRotateY = useTransform(springX, [-500, 500], [-6, 6]);

  const { theme, t } = useTheme();
  const currentSpecCards = theme === "light" ? SPEC_CARDS_LIGHT : SPEC_CARDS_DARK;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set(e.clientX - r.left - r.width / 2);
    mouseY.set(e.clientY - r.top - r.height / 2);
  };

  return (
    <section
      ref={ref}
      aria-label="Hero — Shop premium laptops and PC components"
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: t.bg }}
      className="bf relative flex flex-col overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-40" style={{ background: `radial-gradient(circle at center, transparent 30%, ${theme === 'dark' ? '#000000e6' : '#00000040'} 110%)`, mixBlendMode: theme === 'dark' ? 'normal' : 'multiply' }} />

      <motion.div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 rounded-full pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 800,
          height: 800,
          background: `radial-gradient(circle closest-side, ${t.glowCyan}15 0%, transparent 100%)`,
          mixBlendMode: theme === 'dark' ? "screen" : "multiply",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div aria-hidden="true" className="absolute inset-0 w-full h-full">
        <GridBg parallaxX={bgX} parallaxY={bgY} />
        <div className="hidden md:block absolute inset-0 w-full h-full">
          <Particles count={30} />
        </div>
        <div className="md:hidden absolute inset-0 w-full h-full">
          <Particles count={10} />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        // السر هنا: إجبار الهاتف على إظهار المحتوى كاملاً فوراً
        className="relative w-full flex flex-col z-20 pt-20 sm:pt-24 lg:pt-28 max-md:!opacity-100 max-md:!transform-none"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,55%)] max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 sm:pb-20 gap-6 sm:gap-8 lg:gap-0 items-center">
          
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-20">
            <motion.a href="/pc/gpu" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }} whileHover={{ scale: 1.04, backgroundColor: t.accentTextHover }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold cursor-pointer transition-colors max-md:!opacity-100 max-md:!transform-none" style={{ background: t.accentBadge, border: `1px solid ${t.accentBadgeBorder}`, color: t.accentText }}>
              <motion.span aria-hidden="true" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.accentText }} />
              New Arrivals — RTX 5090 Series
              <motion.span className="inline-block" animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}><FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="text-xs" /></motion.span>
            </motion.a>

            <div className="relative mb-6">
              <motion.h1
                initial={{ opacity: 0.3, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                // السر الثاني: إجبار النص الرئيسي على الظهور بدون أي حركة أو شفافية في الهاتف
                className="hf text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter max-md:!opacity-100 max-md:!scale-100 max-md:!translate-y-0 max-md:!transform-none"
                style={{ color: t.text }}
              >
                <span>Power Beyond</span>
              </motion.h1>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="relative max-md:!opacity-100">
                <h1 aria-hidden="true" className="hf text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter invisible select-none">Limits.</h1>
                <h1 className={`hf absolute inset-0 text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter bg-clip-text text-transparent bg-linear-to-r ${theme === "dark" ? "from-[#06b6d4] via-[#3b82f6] to-[#7c3aed]" : "from-[#0891b2] via-[#2563eb] to-[#7c3aed]"}`}>
                  <TypewriterText text="Limits." delay={0.3} speed={120} accentText={t.accentText} />
                </h1>
              </motion.div>
            </div>

            <div className="relative text-base sm:text-lg leading-relaxed max-w-md mb-8">
              <p aria-hidden="true" className="invisible select-none" style={{ color: t.textSecondary }}>Unleash the future with our curated selection of elite laptops and PC components — built for creators, gamers, and visionaries.</p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="absolute inset-0 max-md:!opacity-100" style={{ color: t.textSecondary }}>
                <TypewriterText text="Unleash the future with our curated selection of elite laptops and PC components — built for creators, gamers, and visionaries." delay={0.4} speed={22} />
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="flex flex-wrap gap-2 justify-center lg:justify-start mb-10 max-md:!opacity-100 max-md:!transform-none">
              {FEATURED_CHIPS.map((chip) => (
                <motion.button key={chip} whileHover={{ scale: 1.06, borderColor: t.chipBorder }} whileTap={{ scale: 0.96 }} className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors" style={{ background: t.cardBg, border: `1px solid ${t.border}`, color: t.textLink }}>{chip}</motion.button>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 z-30 max-md:!opacity-100 max-md:!transform-none">
              <MagneticButton onClick={() => router.push("/shop")} className="group flex w-full sm:w-auto items-center justify-center gap-3 h-14 px-10 rounded-2xl text-base font-bold shadow-2xl" style={{ color: t.text, background: theme === "dark" ? "linear-gradient(135deg,#0ea5e9 0%,#2563eb 60%,#7c3aed 100%)" : "linear-gradient(135deg,#06b6d4 0%,#2563eb 70%,#7c3aed 100%)" }}>
                <motion.div className="absolute inset-0 -skew-x-12 opacity-50" style={{ background: t.shimmer }} animate={{ x: ["-150%", "250%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5 }} />
                <FontAwesomeIcon icon={faBolt} aria-hidden="true" className="relative z-10" />
                <span className="relative z-10">Shop Now</span>
                <motion.span className="group-hover:translate-x-1 transition-transform relative z-10"><FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="text-sm" /></motion.span>
              </MagneticButton>

              <MagneticButton onClick={() => router.push("/deals")} className="group flex w-full sm:w-auto items-center justify-center gap-3 h-14 px-10 rounded-2xl text-base font-bold shadow-lg transition-all" style={{ color: t.text, background: t.cardBg, border: `1px solid ${t.borderLight}` }}>
                <FontAwesomeIcon icon={faTag} aria-hidden="true" className="relative z-10 text-amber-500" />
                <span className="relative z-10">Deals</span>
              </MagneticButton>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }} className="flex items-center gap-3 mt-8 max-md:!opacity-100">
              <div className="flex -space-x-2">
                {REVIEW_AVATARS.map((av, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md" style={{ background: `linear-gradient(135deg, ${av.color}, ${t.bg})`, color: t.text, outline: `2px solid ${t.ring}`, outlineOffset: "-1px" }}>{av.letter}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1" role="img" aria-label="Rating: 4.9 out of 5 stars">
                  {[...Array(5)].map((_, i) => <FontAwesomeIcon key={i} icon={faStar} aria-hidden="true" className="text-amber-400 text-[10px]" />)}
                  <span className="font-bold text-sm ml-1" style={{ color: t.text }}>4.9</span>
                </div>
                <p className="text-xs" style={{ color: t.textMuted }}>from 12,000+ reviews</p>
              </div>
            </motion.div>
          </div>

          <div className="relative flex items-center justify-center w-full overflow-visible z-10">
            <div className="hidden md:block">
              {currentSpecCards.map((card) => (
                <SpecCard
                  key={card.id}
                  label={card.label}
                  value={card.value}
                  color={card.color}
                  delay={card.delay}
                  style={card.position}
                  align={card.align}
                />
              ))}
            </div>
            <LaptopImage parallaxX={laptopX} parallaxY={laptopY} rotateX={laptopRotateX} rotateY={laptopRotateY} />
          </div>
        </div>

        <ScrollIndicator />
      </motion.div>

      <CinematicScrollReveal delay={0.1} className="relative z-20">
        <FeaturedBrands />
      </CinematicScrollReveal>

      <CinematicScrollReveal delay={0.1} className="relative z-20">
        <div className="border-t" style={{ borderTopColor: t.borderLight, background: t.bgTertiary }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i, duration: 0.8 }} className="flex flex-col items-center lg:items-start gap-1 border-r last:border-none px-2 lg:px-6 first:pl-0" style={{ borderRightColor: t.borderLight }}>
                <span className={`hf text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r ${theme === "dark" ? "from-[#06b6d4] to-[#3b82f6]" : "from-[#0891b2] to-[#2563eb]"}`}>
                  <CountUp target={s.value} />
                </span>
                <span className="text-xs sm:text-sm font-medium tracking-wide uppercase" style={{ color: t.textTertiary }}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </CinematicScrollReveal>

      <CinematicScrollReveal delay={0.2} className="relative z-20 pb-10">
        <div className="border-t" style={{ borderTopColor: t.borderLight, background: t.bgSecondary }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TRUST_BADGES.map((badge, i) => (
              <motion.div key={badge.label} whileHover={{ y: -5, scale: 1.02 }} className="group relative flex items-center gap-5 p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-300" style={{ background: t.cardBg, border: `1px solid ${t.borderLight}`, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${badge.color}0f, transparent 80%)` }} />
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg] shadow-xl" style={{ background: `${badge.color}15`, color: badge.color, border: `1px solid ${badge.color}30` }}>
                  <FontAwesomeIcon icon={badge.icon} aria-hidden="true" className="text-xl" />
                </div>
                <div className="leading-none z-10">
                  <p className="text-[16px] font-bold mb-1.5 transition-colors" style={{ color: t.text }}>{badge.label}</p>
                  <p className="text-[13px] font-medium" style={{ color: t.textSubtle }}>{badge.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CinematicScrollReveal>
    </section>
  );
}