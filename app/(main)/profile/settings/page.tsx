"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders, faUser, faLock, faBell } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/store/useAppStore";

function CinematicReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { t, theme } = useTheme();

  return (
    <div className="flex flex-col gap-8">
      <CinematicReveal delay={0.1}>
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: `${t.accentText}15`, color: t.accentText }}
          >
            <FontAwesomeIcon icon={faSliders} />
          </div>
          <div>
            <h1 className="hf text-3xl font-extrabold" style={{ color: t.text }}>Settings</h1>
            <p className="text-[14px] font-medium" style={{ color: t.textSecondary }}>Manage your account preferences and security.</p>
          </div>
        </div>
      </CinematicReveal>

      <div className="grid grid-cols-1 gap-8">
        {/* Personal Information */}
        <CinematicReveal delay={0.2}>
          <div 
            className="rounded-3xl border p-6 lg:p-8 backdrop-blur-md"
            style={{ background: t.cardBg, borderColor: t.borderLight }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon icon={faUser} style={{ color: t.textSecondary }} />
              <h2 className="hf text-xl font-bold" style={{ color: t.text }}>Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textSubtle }}>First Name</label>
                <input 
                  type="text" 
                  defaultValue="John"
                  className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all"
                  style={{ 
                    background: t.bgSecondary, 
                    borderColor: t.borderSubtle, 
                    color: t.text,
                    outlineColor: `${t.accentText}50`
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textSubtle }}>Last Name</label>
                <input 
                  type="text" 
                  defaultValue="Doe"
                  className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all"
                  style={{ 
                    background: t.bgSecondary, 
                    borderColor: t.borderSubtle, 
                    color: t.text,
                    outlineColor: `${t.accentText}50`
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textSubtle }}>Email Address</label>
                <input 
                  type="email" 
                  defaultValue="john.doe@example.com"
                  className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all"
                  style={{ 
                    background: t.bgSecondary, 
                    borderColor: t.borderSubtle, 
                    color: t.text,
                    outlineColor: `${t.accentText}50`
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                className="px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                style={{ 
                  background: theme === "dark" ? "linear-gradient(135deg,#0ea5e9,#2563eb)" : "linear-gradient(135deg,#06b6d4,#2563eb)",
                  color: "#fff",
                  boxShadow: `0 4px 12px ${t.glowCyan}40`
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </CinematicReveal>

        {/* Security */}
        <CinematicReveal delay={0.3}>
          <div 
            className="rounded-3xl border p-6 lg:p-8 backdrop-blur-md"
            style={{ background: t.cardBg, borderColor: t.borderLight }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon icon={faLock} style={{ color: t.textSecondary }} />
              <h2 className="hf text-xl font-bold" style={{ color: t.text }}>Security</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textSubtle }}>Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all"
                  style={{ 
                    background: t.bgSecondary, 
                    borderColor: t.borderSubtle, 
                    color: t.text,
                    outlineColor: `${t.accentText}50`
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textSubtle }}>New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all"
                  style={{ 
                    background: t.bgSecondary, 
                    borderColor: t.borderSubtle, 
                    color: t.text,
                    outlineColor: `${t.accentText}50`
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                className="px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                style={{ background: t.bgSecondary, color: t.text, border: `1px solid ${t.borderLight}` }}
              >
                Update Password
              </button>
            </div>
          </div>
        </CinematicReveal>

        {/* Notifications */}
        <CinematicReveal delay={0.4}>
          <div 
            className="rounded-3xl border p-6 lg:p-8 backdrop-blur-md"
            style={{ background: t.cardBg, borderColor: t.borderLight }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon icon={faBell} style={{ color: t.textSecondary }} />
              <h2 className="hf text-xl font-bold" style={{ color: t.text }}>Notifications</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: t.borderSubtle, background: t.bgSecondary }}>
                <div>
                  <p className="hf font-bold text-base" style={{ color: t.text }}>Order Updates</p>
                  <p className="text-xs font-medium mt-1" style={{ color: t.textSecondary }}>Get notified when your order status changes.</p>
                </div>
                <div className="w-12 h-6 rounded-full relative cursor-pointer" style={{ background: t.accentText }}>
                  <motion.div layout className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: t.borderSubtle, background: t.bgSecondary }}>
                <div>
                  <p className="hf font-bold text-base" style={{ color: t.text }}>Promotions & Deals</p>
                  <p className="text-xs font-medium mt-1" style={{ color: t.textSecondary }}>Receive exclusive offers and updates.</p>
                </div>
                <div className="w-12 h-6 rounded-full relative cursor-pointer" style={{ background: t.borderLight }}>
                  <motion.div layout className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </CinematicReveal>

      </div>
    </div>
  );
}
