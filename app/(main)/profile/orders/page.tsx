"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faDownload, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/store/useAppStore";
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

export default function OrdersPage() {
  const { t, theme } = useTheme();

  const orders = [
    {
      id: "ORD-98234-A",
      date: "Oct 24, 2026",
      status: "Delivered",
      total: "$2,499.00",
      items: [
        { name: "ASUS ROG Strix SCAR 18", qty: 1, price: "$2,499.00", image: "https://dlcdnwebimgs.asus.com/gain/49DA6C45-9CA2-4C1E-8B57-B9C06D606E8A/w250" }
      ],
      statusColor: "#10b981",
    },
    {
      id: "ORD-91730-B",
      date: "Sep 12, 2026",
      status: "Processing",
      total: "$149.99",
      items: [
        { name: "Razer DeathAdder V3 Pro", qty: 1, price: "$149.99", image: "https://assets2.razerzone.com/images/pnx.assets/95a32b2713f9f9b5df4db1704e9c7081/razer-deathadder-v3-pro-white-500x500.png" }
      ],
      statusColor: "#f59e0b",
    },
    {
      id: "ORD-80012-C",
      date: "Aug 05, 2026",
      status: "Cancelled",
      total: "$899.00",
      items: [
        { name: "Intel Core i9-14900K", qty: 1, price: "$599.00", image: "/placeholder.png" },
        { name: "Corsair Vengeance 64GB", qty: 1, price: "$300.00", image: "/placeholder.png" }
      ],
      statusColor: "#ef4444",
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      <CinematicReveal delay={0.1}>
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: `${t.accentText}15`, color: t.accentText }}
          >
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>
          <div>
            <h1 className="hf text-3xl font-extrabold" style={{ color: t.text }}>Order History</h1>
            <p className="text-[14px] font-medium" style={{ color: t.textSecondary }}>Review your past purchases and track deliveries.</p>
          </div>
        </div>
      </CinematicReveal>

      <div className="flex flex-col gap-6">
        {orders.map((order, index) => (
          <CinematicReveal key={order.id} delay={0.2 + index * 0.1}>
            <div 
              className="rounded-3xl border p-5 sm:p-6 lg:p-8 backdrop-blur-md relative overflow-hidden"
              style={{ background: t.cardBg, borderColor: t.borderLight }}
            >
              {/* Header of Order */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b gap-4" style={{ borderColor: t.borderSubtle }}>
                <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>Order Number</p>
                    <p className="hf font-bold text-base" style={{ color: t.text }}>{order.id}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>Date Placed</p>
                    <p className="font-bold text-sm" style={{ color: t.textSecondary }}>{order.date}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>Total Amount</p>
                    <p className="font-bold text-sm" style={{ color: t.textSecondary }}>{order.total}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span 
                    className="px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                    style={{ background: `${order.statusColor}20`, color: order.statusColor, border: `1px solid ${order.statusColor}40` }}
                  >
                    {order.status}
                  </span>
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-black/20 border" style={{ borderColor: t.borderLight, color: t.textSecondary }}>
                    <FontAwesomeIcon icon={faDownload} className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="flex flex-col gap-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border bg-white/5 flex shrink-0" style={{ borderColor: t.borderLight }}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="hf font-bold text-sm sm:text-base truncate" style={{ color: t.text }}>{item.name}</p>
                      <p className="text-xs font-medium" style={{ color: t.textSecondary }}>Qty: {item.qty}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="hf font-bold text-sm sm:text-base" style={{ color: t.text }}>{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="mt-6 pt-5 flex justify-end gap-3 border-t" style={{ borderColor: t.borderSubtle }}>
                <Link href="#">
                  <button 
                    className="px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                    style={{ background: t.bgSecondary, color: t.text, border: `1px solid ${t.borderLight}` }}
                  >
                    View Invoice
                  </button>
                </Link>
                {order.status === "Delivered" && (
                  <button 
                    className="px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                    style={{ 
                      background: theme === "dark" ? "linear-gradient(135deg,#0ea5e9,#2563eb)" : "linear-gradient(135deg,#06b6d4,#2563eb)",
                      color: "#fff",
                      boxShadow: `0 4px 12px ${t.glowCyan}40`
                    }}
                  >
                    Buy Again
                  </button>
                )}
              </div>
            </div>
          </CinematicReveal>
        ))}
      </div>
    </div>
  );
}
