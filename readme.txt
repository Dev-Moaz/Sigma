# Sigma — Design System & Component Generation Guide

> **Purpose of this document:** This README captures the complete design language, animation system, token architecture, and component patterns used across `heroSection.tsx` and `Footer.tsx`. Any new component you generate for this project **must match these patterns exactly** — same motion choreography, same token usage, same cinematic depth, same visual atmosphere.

---

## 1. Stack & Dependencies

| Layer | Library | Notes |
|---|---|---|
| Framework | Next.js (App Router) | `"use client"` at top of every component |
| Animation | `framer-motion` | Core animation engine — **mandatory** |
| Icons | `@fortawesome/react-fontawesome` | Solid + Brands packages |
| State / Theme | `@/store/useAppStore` → `useTheme()` | Custom Zustand store |
| Fonts | Two custom classes | `hf` = heading font, `bf` = body font (applied via `className`) |
| Styling | Tailwind CSS (utility classes) | Extended with CSS-in-JS via `style={{}}` props |

**Critical import pattern:**

```tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useInView, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "@/store/useAppStore";
```

---

## 2. Theme System — `useTheme()`

Every style value comes from the theme hook. **Never hardcode colors.** Never use raw Tailwind color classes for text, backgrounds, or borders — always pull from `t.*`.

```tsx
const { theme, t } = useTheme();
// theme = "dark" | "light"
// t = full token object (see below)
```

### 2.1 Full Token Reference

```ts
// Backgrounds
t.bg              // Primary page background
t.bgSecondary     // Slightly elevated surface (used in footer, trust badges section)
t.bgTertiary      // Stats strip background
t.cardBg          // Card / floating element background
t.cardBgHover     // Card background on hover
t.secondaryBg     // Secondary button background
t.brandBg         // Marquee brand chip background

// Text
t.text            // Primary text
t.textSecondary   // Secondary / body text
t.textSubtle      // Muted text (legal links, labels)
t.textMuted       // Even more muted
t.textTertiary    // Stat labels, caption-level
t.textAccent      // Accent-colored text (secondary button)
t.textLink        // Chip / link text color
t.orangeText      // Badge discount text

// Borders
t.border          // Default border
t.borderLight     // Subtle section dividers
t.borderSubtle    // Dot separators in legal row
t.borderAccent    // Social icon border
t.brandBorder     // Marquee chip border
t.chipBorder      // Category chip hover border

// Accents / Badges
t.accentText      // Primary accent color (cyan/blue)
t.accentTextHover // Accent hover (announcement bar)
t.accentBadge     // Badge background (announcement bar, icon wrappers)
t.accentBadgeBorder // Badge border

t.badgeBg         // Discount badge background
t.badgeBorder     // Discount badge border

// Glow / Atmospheric
t.glowCyan        // Cyan glow color for orbs / blur layers
t.glowPurple      // Purple glow color for orbs / blur layers
t.shimmer         // Shimmer gradient on primary button

// Grid / Background layers
t.gridStroke      // SVG grid line color
t.radialMask      // Radial gradient mask color that fades grid edges

// Ring
t.ring            // Avatar outline color

// Brand text
t.brandText       // Marquee brand chip text color
```

### 2.2 Conditional on `theme`

Some values need `theme === "dark"` branching:

```tsx
// Gradient class on headline or stat numbers
className={`bg-clip-text text-transparent bg-linear-to-r ${
  theme === "dark"
    ? "from-[#06b6d4] via-[#3b82f6] to-[#7c3aed]"
    : "from-[#0891b2] via-[#2563eb] to-[#7c3aed]"
}`}

// Laptop image source
src={theme === "light" ? "/laptop-hero-light-theme.png" : "/laptop-hero-dark-theme.png"}

// Vignette overlay blend mode
mixBlendMode: theme === 'dark' ? 'normal' : 'multiply'

// Particles color
background: theme === "dark" ? "#fff" : "#000"

// Text chromatic aberration shadow (hero h1 only)
textShadow: theme === 'dark' ? textShadowCA : 'none'
```

---

## 3. Typography System

Two custom font classes applied via `className`, not `style`:

- **`hf`** — Heading font. Applied to: `<h1>`, `<h3>` column headings, stat numbers, logo `<a>`, primary CTA labels, brand name.
- **`bf`** — Body font. Applied to the outermost `<section>` / `<footer>` element.

**Scale examples:**
```tsx
// Hero headline
className="hf text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tighter"

// Stat number
className="hf text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent ..."

// Footer column heading
className="hf text-[13px] font-extrabold uppercase tracking-[0.2em]"

// Body / sub-text
className="text-[15px] leading-relaxed font-medium"   // footer description
className="text-xs font-bold tracking-wide uppercase" // legal / copyright
```

---

## 4. Cinematic Background System

Every major section uses **three stacked background layers**:

### Layer 1 — Animated SVG Grid (opacity ~7%)
```tsx
<svg className="absolute inset-0 w-[110%] h-[110%] left-[5%] top-[5%] opacity-[0.07]">
  <defs>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke={t.gridStroke} strokeWidth="0.5" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
</svg>
```
- Use unique `id` per section (e.g. `"grid-footer"`, `"grid-products"`)
- Always set to `w-[110%] h-[110%]` offset by `left-[5%] top-[5%]` to allow parallax movement without revealing edges

### Layer 2 — Radial Edge Mask
```tsx
<div
  className="absolute inset-0"
  style={{
    background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, ${t.radialMask} 75%)`
  }}
/>
```

### Layer 3 — Breathing Glow Orbs
Always two orbs per section, opposite corners:
```tsx
// Cyan orb (top-left or bottom-left)
<motion.div
  className="absolute rounded-full blur-[140px]"
  style={{
    width: 800, height: 800,
    background: `radial-gradient(circle, ${t.glowCyan}, transparent)`,
    top: "-20%", left: "5%"
  }}
  animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
/>

// Purple orb (bottom-right or top-right)
<motion.div
  className="absolute rounded-full blur-[160px]"
  style={{
    width: 700, height: 700,
    background: `radial-gradient(circle, ${t.glowPurple}, transparent)`,
    bottom: "-10%", right: "0%"
  }}
  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
  transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
/>
```

### Layer 4 — Slow Parallax Drift (wraps all bg layers)
```tsx
<motion.div
  className="absolute inset-0 w-full h-full pointer-events-none z-0"
  animate={{ scale: [1, 1.05] }}
  transition={{ duration: 40, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
>
  <GridBg ... />
  <Particles count={30} />
</motion.div>
```

### Layer 5 — Vignette Overlay (always z-40)
```tsx
<div
  className="absolute inset-0 pointer-events-none z-40"
  style={{
    background: `radial-gradient(circle at center, transparent 30%, ${
      theme === 'dark' ? '#000000e6' : '#00000040'
    } 110%)`,
    mixBlendMode: theme === 'dark' ? 'normal' : 'multiply'
  }}
/>
```

---

## 5. Particles System

Floating ambient particles that drift upward infinitely:

```tsx
function Particles({ count = 30 }: { count?: number }) {
  const { theme } = useTheme();
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const size = Math.random() * 4 + 1;          // 1–5px
        const xStart = Math.random() * 100;           // % across width
        const delay = Math.random() * 10;             // 0–10s stagger
        const duration = Math.random() * 10 + 15;    // 15–25s per cycle
        const blur = Math.random() > 0.5 ? "blur(3px)" : "blur(0px)";
        const opacityBase = Math.random() * 0.4 + 0.1;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size, height: size,
              left: `${xStart}%`,
              background: theme === "dark" ? "#fff" : "#000",
              filter: blur
            }}
            initial={{ y: "110vh", opacity: 0, x: 0 }}
            animate={{
              y: "-10vh",
              opacity: [0, opacityBase, opacityBase, 0],
              x: [0, Math.random() * 60 - 30, Math.random() * 60 - 30]
            }}
            transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}
```

- Hero: `count={40}`, Footer: `count={30}`, other sections: `count={20}` to `count={30}`
- **Must be inside** the slow-drift wrapper (scale animation) to breathe with the background

---

## 6. Mouse Parallax System (Hero / Interactive Sections)

Used in the Hero to give depth to background, laptop image, and floating cards:

```tsx
const mouseX = useMotionValue(0);
const mouseY = useMotionValue(0);

const springConfig = { stiffness: 40, damping: 20, mass: 0.5 };
const springX = useSpring(mouseX, springConfig);
const springY = useSpring(mouseY, springConfig);

// Layers move at different speeds = depth illusion
const bgX     = useTransform(springX, [-500, 500], [15, -15]);    // slow (background)
const bgY     = useTransform(springY, [-500, 500], [15, -15]);
const laptopX = useTransform(springX, [-500, 500], [-10, 10]);    // medium (main subject)
const laptopY = useTransform(springY, [-500, 500], [-10, 10]);
const fgX     = useTransform(springX, [-500, 500], [-25, 25]);    // fast (foreground cards)
const fgY     = useTransform(springY, [-500, 500], [-25, 25]);

// Chromatic aberration on headline text (dark mode only)
const textShadowCA = useTransform(
  springX,
  [-500, 500],
  ["-3px 0 0 rgba(255,0,0,0.5), 3px 0 0 rgba(0,255,255,0.5)",
   "3px 0 0 rgba(255,0,0,0.5), -3px 0 0 rgba(0,255,255,0.5)"]
);

const handleMouseMove = (e: React.MouseEvent) => {
  const r = ref.current?.getBoundingClientRect();
  if (!r) return;
  mouseX.set(e.clientX - r.left - r.width / 2);
  mouseY.set(e.clientY - r.top - r.height / 2);
};
```

Apply to section:
```tsx
<motion.section ref={ref} onMouseMove={handleMouseMove} ...>
```

---

## 7. Animation Patterns

### 7.1 Cinematic Entrance (Page Load — Hero)

All elements reveal on load with blur+translate transitions. Use staggered `delay` values:

```
delay: 1.2  → laptop image
delay: 1.8  → announcement badge
delay: 2.0  → headline line 1
delay: 2.4  → headline line 2 (typewriter starts)
delay: 3.0  → CTA buttons
delay: 3.2  → filter chips
delay: 3.5  → scroll indicator
delay: 3.8  → social proof row
```

Standard blur-reveal pattern:
```tsx
initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
transition={{ delay: X, duration: 0.8, ease: "easeOut" }}
```

Heavy blur for headline:
```tsx
initial={{ opacity: 0, filter: "blur(30px)", scale: 0.9, y: 40 }}
animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
transition={{ delay: 2.0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
```

**Black fade-in overlay (first thing rendered in hero):**
```tsx
<motion.div
  className="absolute inset-0 z-50 pointer-events-none bg-black"
  initial={{ opacity: 1 }}
  animate={{ opacity: 0 }}
  transition={{ duration: 1.5, ease: "easeInOut" }}
/>
```

### 7.2 Scroll Reveal Wrapper

Wrap every major sub-section in this component:
```tsx
function CinematicScrollReveal({
  children, delay = 0, className = ""
}: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, filter: "blur(15px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### 7.3 whileInView Pattern (for child items within a section)

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: 0.1 * index, duration: 0.8 }}
>
```

### 7.4 Floating / Bobbing Animation

Used for spec cards and other floating elements:
```tsx
animate={{ y: [0, -6, 0] }}
transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: staggerDelay }}
```

### 7.5 Breathing Orbs / Pulsing Elements
```tsx
animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
```

### 7.6 Infinite Horizontal Marquee
```tsx
<motion.div
  className="flex w-max"
  animate={{ x: ["0%", "-50%"] }}
  transition={{ duration: 45, ease: "linear", repeat: Infinity }}
>
  {/* Render the full set twice for seamless loop */}
  {[0, 1].map(groupIdx => (
    <div key={groupIdx} className="flex gap-4 pr-4">
      {ITEMS.map((item, i) => <Chip key={`${item}-${i}`} ... />)}
    </div>
  ))}
</motion.div>
```
Edge fade masks:
```tsx
<div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10"
  style={{ background: `linear-gradient(90deg, ${t.bg}, transparent)` }} />
<div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10"
  style={{ background: `linear-gradient(270deg, ${t.bg}, transparent)` }} />
```

### 7.7 Rotating Conic Gradient (God Ray / Aura)
```tsx
<motion.div
  className="absolute inset-0 rounded-full mix-blend-screen opacity-60 -z-10"
  style={{
    background: `conic-gradient(from 180deg at 50% 50%, transparent 0deg, ${t.glowCyan}33 90deg, transparent 180deg, ${t.glowPurple}33 270deg, transparent 360deg)`,
    filter: "blur(40px)"
  }}
  animate={{ rotate: 360 }}
  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
/>
```

### 7.8 Shimmer Sweep (on primary CTA button)
```tsx
<motion.div
  className="absolute inset-0 -skew-x-12 opacity-50"
  style={{ background: t.shimmer }}
  animate={{ x: ["-150%", "250%"] }}
  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5 }}
/>
```

---

## 8. Reusable Component Patterns

### 8.1 Magnetic Button (Primary CTA)

```tsx
function MagneticButton({ children, onClick, className, style }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });
  const [ripples, setRipples] = useState([]);

  return (
    <motion.button
      ref={ref}
      style={{ ...style, x: springX, y: springY }}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={(e) => {
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        x.set((e.clientX - (left + width / 2)) * 0.3);
        y.set((e.clientY - (top + height / 2)) * 0.3);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={(e) => {
        const rect = ref.current.getBoundingClientRect();
        setRipples(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() }]);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Shimmer sweep inside */}
      <motion.div
        className="absolute inset-0 -skew-x-12 opacity-50"
        style={{ background: t.shimmer }}
        animate={{ x: ["-150%", "250%"] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5 }}
      />
      {children}
      <AnimatePresence>
        {ripples.map((rip) => (
          <motion.span
            key={rip.id}
            initial={{ top: rip.y, left: rip.x, width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 300, height: 300, opacity: 0, top: rip.y - 150, left: rip.x - 150 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none bg-white/30 mix-blend-overlay"
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
```

**Primary CTA gradient:**
```tsx
style={{
  color: t.text,
  background: theme === "dark"
    ? "linear-gradient(135deg,#0ea5e9 0%,#2563eb 60%,#7c3aed 100%)"
    : "linear-gradient(135deg,#06b6d4 0%,#2563eb 70%,#7c3aed 100%)"
}}
className="group flex items-center justify-center gap-3 h-14 px-8 rounded-2xl text-base font-bold shadow-2xl"
```

### 8.2 Magnetic Social Icon

```tsx
function MagneticSocial({ icon, href, ariaLabel }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      onMouseMove={(e) => {
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - (rect.left + rect.width / 2)) * 0.4);
        y.set((e.clientY - (rect.top + rect.height / 2)) * 0.4);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: springX, y: springY, background: t.cardBg, borderColor: t.borderAccent, color: t.textSecondary }}
      whileHover={{
        scale: 1.2,
        color: t.accentText,
        boxShadow: `0 0 20px ${t.glowCyan}55`,
        borderColor: t.accentText
      }}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 z-10"
    >
      <FontAwesomeIcon icon={icon} className="text-base relative z-10" />
    </motion.a>
  );
}
```

### 8.3 Floating HUD Spec Card

Positioned absolutely around a central product image. Each card has a connector line + dot pointing inward:

```tsx
function SpecCard({ label, value, color, delay, style, parallaxX, parallaxY, align }) {
  const baseRevealDelay = 2.4;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ delay: baseRevealDelay, duration: 0.8, ease: "easeOut" }}
      style={{ ...style, x: parallaxX, y: parallaxY }}
      className="absolute z-20 cursor-pointer group"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
        className="relative flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border"
        style={{
          background: t.bgSecondary,
          borderColor: `${color}40`,
          boxShadow: `0 0 20px ${color}10, inset 0 0 10px ${color}05`
        }}
      >
        {/* Connector line + dot */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          transition={{ delay: baseRevealDelay + 0.5, duration: 0.8, ease: "circOut" }}
          className="absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
          style={{
            [align === "left" ? "left" : "right"]: "100%",
            flexDirection: align === "left" ? "row" : "row-reverse"
          }}
        >
          <div className="h-px w-full"
            style={{ background: `linear-gradient(to ${align === "left" ? "right" : "left"}, ${color}80, transparent)` }} />
          <div className="w-1 h-1 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        </motion.div>

        {/* Ping dot indicator */}
        <div className="relative w-2 h-2 rounded-full shrink-0 group-hover:scale-150 transition-all duration-300"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}>
          <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ background: color }} />
        </div>

        <div className="leading-tight">
          <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5 opacity-70" style={{ color: t.textSecondary }}>{label}</p>
          <p className="hf text-sm font-bold tracking-wide" style={{ color: t.text }}>{value}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

### 8.4 CountUp Number Animation

```tsx
function CountUp({ target }: { target: string }) {
  const ref = useRef(null);
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
      const progress = Math.min((ts - start) / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setVal(Math.floor(eased * numeric));
      if (progress < 1) requestAnimationFrame(step);
      else setVal(numeric);
    };
    requestAnimationFrame(step);
  }, [inView, numeric]);

  if (isNaN(numeric)) return <span ref={ref}>{target}</span>;
  return <span ref={ref}>{val}{rest}</span>;
}
```

### 8.5 Typewriter Text

```tsx
function TypewriterText({ text, delay = 0, speed = 60, accentText }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || displayed.length >= text.length) { setDone(true); return; }
    const timer = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(timer);
  }, [started, displayed, text, speed]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="inline-block w-0.5 h-[0.85em] rounded-sm ml-1 align-middle"
          style={{
            background: accentText || "linear-gradient(180deg,#06b6d4,#3b82f6)",
            boxShadow: `0 0 8px ${accentText || "#06b6d4"}`
          }}
        />
      )}
    </span>
  );
}
```

### 8.6 Scroll Indicator

```tsx
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.5, duration: 1 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
    >
      <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: t.textSubtle }}>Scroll</p>
      <motion.div
        className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
        style={{ borderColor: t.border }}
      >
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
```

### 8.7 Accent Line (top-of-section separator)

Referenced as `<AccentLine />` from `@/components/ui/AccentLine`. When recreating manually:
```tsx
// Animated gradient top border line
<motion.div
  className="absolute top-0 left-0 right-0 h-px z-20"
  style={{ background: "linear-gradient(90deg, transparent, #06b6d4, #3b82f6, #7c3aed, transparent)" }}
  animate={{ opacity: [0.4, 1, 0.4] }}
  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
/>
```

---

## 9. Card Patterns

### Trust Badge Card
```tsx
<motion.div
  whileHover={{ y: -5, scale: 1.02 }}
  className="group relative flex items-center gap-5 p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-300"
  style={{
    background: t.cardBg,
    border: `1px solid ${t.borderLight}`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
  }}
>
  {/* Hover glow overlay */}
  <div
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
    style={{ background: `radial-gradient(circle at 50% 50%, ${accentColor}0f, transparent 80%)` }}
  />
  {/* Icon container */}
  <div
    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg] shadow-xl"
    style={{
      background: `${accentColor}15`,
      color: accentColor,
      border: `1px solid ${accentColor}30`
    }}
  >
    <FontAwesomeIcon icon={icon} className="text-xl" />
  </div>
  <div className="leading-none z-10">
    <p className="text-[16px] font-bold mb-1.5" style={{ color: t.text }}>{label}</p>
    <p className="text-[13px] font-medium" style={{ color: t.textSubtle }}>{sub}</p>
  </div>
</motion.div>
```

### Footer Link with Reveal Underline + Arrow
```tsx
<motion.a
  href={href}
  className="group relative inline-flex items-center gap-2 py-1.5 text-sm font-bold transition-colors duration-300"
  style={{ color: t.textSecondary }}
  whileHover={{ x: 8, color: t.accentText }}
>
  {/* Slide-in underline */}
  <span
    className="absolute left-0 -bottom-1 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full"
    style={{
      background: "linear-gradient(90deg,#06b6d4,#3b82f6)",
      boxShadow: "0 0 8px rgba(6,182,212,0.6)"
    }}
  />
  {/* Arrow icon that slides in */}
  <FontAwesomeIcon
    icon={faArrowRight}
    className="text-[10px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
  />
  {label}
</motion.a>
```

### Announcement Badge / Pill
```tsx
<motion.a
  whileHover={{ scale: 1.04, backgroundColor: t.accentTextHover }}
  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer backdrop-blur-md"
  style={{
    background: t.accentBadge,
    border: `1px solid ${t.accentBadgeBorder}`,
    color: t.accentText
  }}
>
  {/* Pulsing dot */}
  <motion.span
    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
    transition={{ duration: 2, repeat: Infinity }}
    className="w-2 h-2 rounded-full shrink-0"
    style={{ backgroundColor: t.accentText }}
  />
  Announcement Text
  {/* Bouncing arrow */}
  <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
  </motion.span>
</motion.a>
```

### Column Heading with Accent Bar
```tsx
<div className="flex items-center gap-3">
  <span
    className="w-1 h-5 rounded-full shrink-0"
    style={{
      background: "linear-gradient(180deg,#06b6d4,#3b82f6)",
      boxShadow: "0 0 10px rgba(6,182,212,0.8)"
    }}
  />
  <h3 className="hf text-[13px] font-extrabold uppercase tracking-[0.2em]" style={{ color: t.text }}>
    {heading}
  </h3>
</div>
```

---

## 10. Layout Rules

### Z-Index Stack (from back to front)
```
z-0   → bg layers (grid, orbs, particles wrapper)
z-10  → main content, sections
z-20  → floating cards, scroll indicator, sticky elements
z-30  → interactive overlays
z-40  → vignette overlay
z-50  → floating cards on hover, modals
```

### Section Structure Template
```tsx
<section className="bf relative overflow-hidden" style={{ backgroundColor: t.bgSecondary }}>

  {/* 1. Vignette — z-40 */}
  <div className="absolute inset-0 pointer-events-none z-40" style={{ ... }} />

  {/* 2. Slow-drift bg container — z-0 */}
  <motion.div
    className="absolute inset-0 w-full h-full pointer-events-none z-0"
    animate={{ scale: [1, 1.05] }}
    transition={{ duration: 40, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
  >
    <GridBg />
    <Particles count={25} />
  </motion.div>

  {/* 3. Accent top line */}
  <AccentLine duration={5} opacity={0.6} />

  {/* 4. Main content — z-10 */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
    {/* content */}
  </div>

</section>
```

### Max Width & Padding
```
max-w-7xl mx-auto px-4 sm:px-6
```

### Grid Systems Used
```tsx
// Hero: text + image
grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,55%)]

// Trust badges
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6

// Stats
grid grid-cols-2 lg:grid-cols-4 gap-6

// Footer columns
grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-12 lg:gap-8
```

---

## 11. Accent Color System (Hardcoded Values)

These gradient stops are used directly (not from tokens) for gradient text and borders:

| Use | Dark mode | Light mode |
|---|---|---|
| Text gradient (heading) | `from-[#06b6d4] via-[#3b82f6] to-[#7c3aed]` | `from-[#0891b2] via-[#2563eb] to-[#7c3aed]` |
| CTA button | `#0ea5e9 → #2563eb → #7c3aed` | `#06b6d4 → #2563eb → #7c3aed` |
| Accent bar / column heading | `#06b6d4 → #3b82f6` (vertical) | same |
| Underline hover | `#06b6d4 → #3b82f6` (horizontal) | same |
| Shadow glow on underline | `rgba(6,182,212,0.6)` | same |
| Spec card connector gradient | `${color}80 → transparent` | same |

---

## 12. Rules for Generating a New Component

When generating any new section or component for this project:

1. **Start with `"use client"` and all necessary imports.**
2. **Wrap the outermost element with `bf` class and `style={{ backgroundColor: t.bgSecondary }}`** (or `t.bg` for primary sections).
3. **Include all 5 background layers** (grid, radial mask, orbs, particles, vignette) unless the section is deliberately minimal.
4. **Use `CinematicScrollReveal`** to wrap the entire section content.
5. **Use `whileInView` with `viewport={{ once: true }}`** for all child cards and items — stagger with `delay: 0.1 * index`.
6. **Never hardcode colors** — always use `t.*` tokens.
7. **Apply `hf` class to all headings and prominent numbers.** Apply `bf` to the section root.
8. **Font weights:** headings = `font-extrabold`, sub-labels = `font-bold`, body = `font-medium`.
9. **Hover interactions on cards:** always include `whileHover={{ y: -5, scale: 1.02 }}` + a radial glow overlay that appears on `group-hover`.
10. **Icon containers:** `rounded-xl`, `w-14 h-14`, background = `${accentColor}15`, border = `1px solid ${accentColor}30`, hover: `scale-110 rotate-[8deg]`.
11. **Section borders:** `border-t` with `style={{ borderTopColor: t.borderLight }}`.
12. **Grid lines inside SVG:** `opacity-[0.07]`, unique `id` per section.
13. **Respect the z-index stack** — content at z-10, vignette at z-40.
14. **All animations repeat infinitely where atmospheric** (orbs, particles, marquee, shimmer) and run **once** for entrance reveals.
