"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScaleBalanced, faXmark, faChevronRight, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useTheme, useCompare } from "@/store/useAppStore";
import Link from "next/link";
import laptopsData from "@/data/laptops.json";
import hardwareData from "@/data/hardware.json";
import type { Product } from "@/lib/laptop-schema";
import type { HardwareProduct } from "@/lib/hardware-schema";

export function CompareBar() {
  const { t, theme } = useTheme();
  const { compareIds, compareCount, toggleCompare, clearCompare } = useCompare();

  if (compareCount === 0) return null;

  // Resolve products from IDs
  const selectedProducts = compareIds.map(id => {
    const laptop = (laptopsData as Product[]).find(p => p.id === id);
    if (laptop) return { id, name: laptop.name, image: laptop.image, type: 'laptop' };
    
    const hardware = (hardwareData as HardwareProduct[]).find(p => p.id === id);
    if (hardware) return { id, name: hardware.name, image: hardware.images[0] || "", type: 'hardware' };
    
    return null;
  }).filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-4xl"
      >
        <div 
          className="relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl p-4 flex flex-wrap items-center justify-between gap-6"
          style={{ 
            background: theme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            borderColor: t.borderLight,
            boxShadow: theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)' : '0 20px 40px rgba(0,0,0,0.1)'
          }}
        >
          {/* HUD Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(${t.accentText} 1px, transparent 0)`, backgroundSize: '20px 20px' }} />

          <div className="flex items-center gap-6 flex-1 min-w-[300px]">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
              >
                <FontAwesomeIcon icon={faScaleBalanced} className="text-white text-lg" />
              </div>
              <div>
                <h4 className="hf text-sm font-black uppercase tracking-wider" style={{ color: t.text }}>Comparison</h4>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest" style={{ color: t.textSecondary }}>{compareCount} / 4 Selected</p>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
              {selectedProducts.map((p) => (
                <motion.div 
                  key={p!.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="group relative flex-shrink-0"
                >
                  <div 
                    className="w-14 h-14 rounded-xl border-2 overflow-hidden bg-black/10 transition-colors"
                    style={{ borderColor: t.borderLight }}
                  >
                    <img src={p!.image} alt={p!.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <button 
                    onClick={() => toggleCompare(p!.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </motion.div>
              ))}
              
              {compareCount < 4 && Array.from({ length: 4 - compareCount }).map((_, i) => (
                <div 
                  key={`empty-${i}`}
                  className="w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: t.borderLight, opacity: 0.3 }}
                >
                  <span className="text-xs font-black" style={{ color: t.textSecondary }}>+</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={clearCompare}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80 flex items-center gap-2"
              style={{ color: t.textSecondary }}
            >
              <FontAwesomeIcon icon={faTrashCan} />
              Clear
            </button>

            <Link href="/compare">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-xl"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb, #7c3aed)' }}
              >
                Compare Now
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
