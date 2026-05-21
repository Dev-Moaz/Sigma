"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBoxOpen,
  faSliders,
  faSignOutAlt,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/store/useAppStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUserAction, getUserProfileAction } from "@/app/actions/auth";
import { supabase } from "@/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Particles({ count = 20 }: { count?: number }) {
  const { theme } = useTheme();
  const particles = useRef(
    Array.from({ length: count }, () => ({
      size: Math.random() * 2.5 + 0.5,
      xStart: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 16,
      opacityBase: Math.random() * 0.25 + 0.06,
      xEnd: Math.random() * 40 - 20,
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
              width: p.size,
              height: p.size,
              left: `${p.xStart}%`,
              bottom: "-4px",
              background: theme === "dark" ? "#ffffff" : "#000000",
              "--op": p.opacityBase,
              "--tx": `${p.xEnd}px`,
              animation: `pr-float-up ${p.duration}s linear ${p.delay}s infinite`,
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
        <pattern id="grid-profile" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke={t.gridStroke} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-profile)" />
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { theme, t } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = React.useState<any>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Failed to sign out:", err);
      router.push("/login");
    }
  };

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getCurrentUserAction();
        if (user) {
          const profData = await getUserProfileAction(user.id);
          if (profData) {
            setProfile(profData);
            setIsAdmin(profData.role === "admin");
          }
        }
      } catch (err) {
        console.error("Failed to load profile layout details", err);
      }
    }
    loadProfile();
  }, []);

  const navLinks = [
    { label: "Overview", href: "/profile", icon: faUser, exact: true },
    { label: "Order History", href: "/profile/orders", icon: faBoxOpen, exact: false },
    { label: "Settings", href: "/profile/settings", icon: faSliders, exact: false },
    ...(isAdmin ? [{ label: "Admin Dashboard", href: "/admin", icon: faShieldHalved, exact: false }] : [])
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pr-float-up {
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Navigation */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:w-64 shrink-0 flex flex-col gap-2"
            >
              <div 
                className="p-6 rounded-2xl mb-4 backdrop-blur-xl border flex items-center gap-4"
                style={{ background: t.cardBg, borderColor: t.borderLight }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ background: `${t.accentText}15`, color: t.accentText, border: `1px solid ${t.accentText}30` }}
                >
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                  <p className="hf font-bold text-lg leading-tight" style={{ color: t.text }}>{profile?.full_name || "Loading..."}</p>
                  <p className="text-xs font-medium" style={{ color: t.textSecondary }}>{profile?.role === "admin" ? "System Admin" : "Premium Member"}</p>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible hide-scrollbar pb-2 lg:pb-0">
                {navLinks.map((link) => {
                  const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                  
                  return (
                    <Link key={link.href} href={link.href} className="shrink-0">
                      <div 
                        className="flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm"
                        style={{
                          background: isActive ? (theme === "dark" ? "linear-gradient(135deg,#0ea5e920,#2563eb20)" : "linear-gradient(135deg,#06b6d415,#2563eb15)") : "transparent",
                          color: isActive ? t.accentText : t.textSecondary,
                          border: `1px solid ${isActive ? t.borderAccent : 'transparent'}`,
                          boxShadow: isActive ? `0 0 20px ${t.glowCyan}15` : 'none'
                        }}
                      >
                        <FontAwesomeIcon icon={link.icon} className={isActive ? "opacity-100" : "opacity-50"} />
                        {link.label}
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t" style={{ borderColor: t.borderLight }}>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm text-red-500 hover:bg-red-500/10 cursor-pointer bg-transparent border-none text-left"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="opacity-70" />
                  Sign Out
                </button>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {children}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
