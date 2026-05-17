"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faHeart,
  faStar,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme, useWishlist } from "@/store/useAppStore";
import Link from "next/link";

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

export default function ProfileOverview() {
  const { t, theme } = useTheme();
  const { wishIds } = useWishlist();

  const stats = [
    { label: "Total Orders", value: "3", icon: faBox, color: "#3b82f6" },
    { label: "Saved Items", value: wishIds.length.toString(), icon: faHeart, color: "#ef4444" },
    { label: "Volt Points", value: "1,250", icon: faStar, color: "#eab308" },
  ];

  const recentOrders = [
    {
      id: "ORD-98234-A",
      date: "Oct 24, 2026",
      status: "Delivered",
      total: "$2,499.00",
      items: "ASUS ROG Strix SCAR 18",
      statusColor: "#10b981"
    },
    {
      id: "ORD-91730-B",
      date: "Sep 12, 2026",
      status: "Processing",
      total: "$149.99",
      items: "Razer DeathAdder V3 Pro",
      statusColor: "#f59e0b"
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <CinematicReveal delay={0.1}>
        <div>
          <h1 className="hf text-3xl font-extrabold mb-2" style={{ color: t.text }}>Dashboard</h1>
          <p className="text-[15px] font-medium" style={{ color: t.textSecondary }}>
            Welcome back to your command center.
          </p>
        </div>
      </CinematicReveal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <CinematicReveal key={stat.label} delay={0.2 + i * 0.1}>
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden group"
              style={{ background: t.cardBg, borderColor: t.borderLight }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at right bottom, ${stat.color}, transparent)` }}
              />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: t.textSubtle }}>{stat.label}</p>
                  <p className="hf text-3xl font-extrabold" style={{ color: t.text }}>{stat.value}</p>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: `${stat.color}15`, color: stat.color }}
                >
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
              </div>
            </motion.div>
          </CinematicReveal>
        ))}
      </div>

      {/* Recent Orders section */}
      <CinematicReveal delay={0.5}>
        <div 
          className="rounded-3xl border p-6 lg:p-8 backdrop-blur-xl"
          style={{ background: t.cardBg, borderColor: t.borderLight }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="hf text-xl font-bold" style={{ color: t.text }}>Recent Activity</h2>
            <Link href="/profile/orders">
              <span className="text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors" style={{ color: t.accentText }}>
                View All <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </span>
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentOrders.map((order, i) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors hover:bg-black/20"
                style={{ borderColor: t.borderSubtle, background: t.bgSecondary }}
              >
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="hf font-bold text-sm" style={{ color: t.text }}>{order.id}</p>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `${order.statusColor}20`, color: order.statusColor }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: t.textSecondary }}>
                    {order.date} • {order.items}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="hf font-bold text-lg" style={{ color: t.text }}>{order.total}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CinematicReveal>

    </div>
  );
}
