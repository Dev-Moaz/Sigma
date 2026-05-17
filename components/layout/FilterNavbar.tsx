// components/layout/FilterNavbar.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, 
  faSliders, 
  faArrowDownWideShort, 
  faXmark 
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/store/useAppStore";
import type { Product } from "@/lib/laptop-schema"; 
import type { HardwareProduct } from "@/lib/hardware-schema";

export type UnifiedProduct = Product | HardwareProduct;

interface FilterNavbarProps<T extends UnifiedProduct> {
  products: T[];
  onFilterChange: (filtered: T[]) => void;
  // خصائص اختيارية للتحكم اليدوي في إخفاء الفلاتر
  hideCategoryFilter?: boolean;
  hideBrandFilter?: boolean;
}

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

export default function FilterNavbar<T extends UnifiedProduct>({ 
  products, 
  onFilterChange,
  hideCategoryFilter = false,
  hideBrandFilter = false
}: FilterNavbarProps<T>) {
  const { theme, t } = useTheme();

  // ─── Smart Data Extraction ───
  // استخراج الفئات والماركات المتاحة فقط في المنتجات الممررة
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const availableBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand));
    return ["All", ...Array.from(brands)];
  }, [products]);

  // ─── Auto-Hide Logic (الذكاء في العرض) ───
  // إذا كانت المنتجات تحتوي على فئة واحدة فقط أو ماركة واحدة، لا داعي لعرض الفلتر
  const shouldShowCategories = !hideCategoryFilter && availableCategories.length > 2; 
  const shouldShowBrands = !hideBrandFilter && availableBrands.length > 2;

  // ─── State ───
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeBrand, setActiveBrand] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // ─── Core Filtering Engine (Fast & Reactive) ───
  useEffect(() => {
    let result: T[] = [...products];

    // Helper لجلب السعر النهائي (يتعامل مع الخصومات بشكل ذكي)
    const getFinalPrice = (product: UnifiedProduct) => {
      return ('discountPrice' in product && product.discountPrice) 
        ? product.discountPrice 
        : product.price;
    };

    // 1. Search Filter (يبحث في الاسم والماركة)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter (يُطبق فقط إذا كان الفلتر ظاهراً وقيمته ليست All)
    if (shouldShowCategories && activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    // 3. Brand Filter (يُطبق فقط إذا كان الفلتر ظاهراً وقيمته ليست All)
    if (shouldShowBrands && activeBrand !== "All") {
      result = result.filter(p => p.brand === activeBrand);
    }

    // 4. Sorting Engine
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
        break;
      case "price-desc":
        result.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // "featured" يحافظ على الترتيب الأصلي في الـ JSON
        break;
    }

    onFilterChange(result);
  }, [products, searchQuery, activeCategory, activeBrand, sortBy, shouldShowCategories, shouldShowBrands, onFilterChange]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="w-full transition-all duration-500 ease-out py-3 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* ─── Left: Search ─── */}
          <div className="flex w-full md:w-auto items-center gap-3">
            <motion.div 
              className="relative flex items-center overflow-hidden rounded-2xl border transition-all duration-300"
              style={{ 
                background: t.searchBg, 
                borderColor: isSearchFocused ? t.accentText : t.searchBorder,
                boxShadow: isSearchFocused ? `0 0 0 3px ${t.accentBadge}` : "none"
              }}
              animate={{ width: isSearchFocused ? 280 : 200 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-sm" style={{ color: isSearchFocused ? t.accentText : t.textSubtle }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full bg-transparent border-none outline-none pl-9 pr-8 py-2.5 text-sm font-medium hf"
                style={{ color: t.text }}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: t.borderLight, color: t.textSecondary }}
                    whileHover={{ background: t.borderSubtle, color: t.text }}
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ─── Center: Dynamic Chips (Categories) ─── */}
          {shouldShowCategories && (
            <div className="w-full md:flex-1 overflow-x-auto hide-scrollbar">
              <div className="flex items-center md:justify-center gap-2 px-1 min-w-max">
                {availableCategories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={`cat-${cat}`}
                      onClick={() => setActiveCategory(cat)}
                      className="relative px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-colors duration-300 hf"
                      style={{ color: isActive ? t.bg : t.textSecondary }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryBg"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${t.glowCyan}, ${t.glowPurple})`,
                            boxShadow: `0 4px 12px ${t.accentBadgeBorder}`
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Right: Sorting Dropdown ─── */}
          <div className={`w-full md:w-auto flex items-center justify-end shrink-0 ${!shouldShowCategories ? 'ml-auto' : ''}`}>
            <div className="relative group">
              <div 
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border cursor-pointer transition-all duration-300"
                style={{ background: t.cardBg, borderColor: t.borderLight }}
              >
                <FontAwesomeIcon icon={faArrowDownWideShort} className="text-xs" style={{ color: t.textSecondary }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent border-none outline-none appearance-none text-sm font-bold pr-4 cursor-pointer hf"
                  style={{ color: t.text }}
                >
                  <option value="featured" style={{ background: t.dropdownBg }}>Featured</option>
                  <option value="price-asc" style={{ background: t.dropdownBg }}>Price: Low to High</option>
                  <option value="price-desc" style={{ background: t.dropdownBg }}>Price: High to Low</option>
                  <option value="rating" style={{ background: t.dropdownBg }}>Top Rated</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* ─── Bottom: Secondary Bar for Brands ─── */}
        <AnimatePresence>
          {shouldShowBrands && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                <span className="text-xs font-bold uppercase tracking-widest mr-2 shrink-0" style={{ color: t.textMuted }}>Brands:</span>
                {availableBrands.map((brand) => {
                  const isActive = activeBrand === brand;
                  return (
                    <button
                      key={`brand-${brand}`}
                      onClick={() => setActiveBrand(brand)}
                      className="relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border shrink-0 hf"
                      style={{
                        background: isActive ? t.brandBg : "transparent",
                        borderColor: isActive ? t.accentText : t.borderLight,
                        color: isActive ? t.accentText : t.textSubtle
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeBrandBorder"
                          className="absolute inset-0 rounded-lg border-2 pointer-events-none"
                          style={{ borderColor: t.accentText, boxShadow: `inset 0 0 8px ${t.accentBadgeBorder}` }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      {brand}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}