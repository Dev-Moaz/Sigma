// components/HardwareCategoryPage.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

// Stores & Layouts
import { useTheme, useCart, useWishlist } from "@/store/useAppStore";
import FilterNavbar from "@/components/layout/FilterNavbar";
import HardwareProductCard from "@/components/ui/HardwareProductCard";

// Types
import { HardwareProduct } from "@/lib/hardware-schema";

const ITEMS_PER_PAGE = 12;

import { Particles } from "@/components/ui/Particles";
import { CinematicReveal as CinematicScrollReveal } from "@/components/ui/CinematicReveal";
import { AccentLine } from "@/components/ui/AccentLine";

interface CategoryPageProps {
  initialHardware: HardwareProduct[];
  categoryName: string; 
  title?: string;
  description?: string;
}

export default function CategoryPage({ initialHardware, categoryName, title, description }: CategoryPageProps) {
  const { isDark, t } = useTheme();
  const router = useRouter();

  // تصفية قطع الهاردوير الحية على مستوى العميل للفئة المطلوبة فقط
  const categoryProducts = useMemo(() => {
    return initialHardware.filter(
      (product) => product.category.toLowerCase() === categoryName.toLowerCase()
    );
  }, [initialHardware, categoryName]);

  // State للمنتجات المفلترة
  const [filteredProducts, setFilteredProducts] = useState<HardwareProduct[]>(categoryProducts);
  const [currentPage, setCurrentPage] = useState(1);

  // تحديث الـ State إذا تغيرت قطع الهاردوير على الخادم أو تغير القسم المتصفح
  useEffect(() => {
    setFilteredProducts(categoryProducts);
    setCurrentPage(1);
  }, [categoryProducts]);

  // معالجة الفلاتر الإضافية
  const handleFilterChange = useCallback((newFiltered: HardwareProduct[]) => {
    setFilteredProducts(newFiltered);
    setCurrentPage(1);
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main
      className="relative overflow-hidden min-h-screen flex flex-col pt-8 pb-24"
      style={{ backgroundColor: t.bg }}
    >
      <AccentLine />
      
      {/* Background Layers */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <svg className="absolute inset-0 w-[110%] h-[110%] left-[-5%] top-[-5%] opacity-[0.07]">
          <defs>
            <pattern id="grid-shop" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={t.gridStroke} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-shop)" />
        </svg>
        <Particles count={30} />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes breathScale { 0%, 100% { transform: scale(1); opacity: 0.10; } 50% { transform: scale(1.15); opacity: 0.2; } }`,
        }}
      />
      
      {/* Background Lighting */}
      <div
        className="absolute rounded-full blur-[100px] z-0 pointer-events-none"
        style={{
          width: 800,
          height: 800,
          background: `radial-gradient(circle, ${t.glowCyan}, transparent)`,
          top: "-15%",
          left: "-10%",
          animation: "breathScale 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full blur-[120px] z-0 pointer-events-none"
        style={{
          width: 700,
          height: 700,
          background: `radial-gradient(circle, ${t.glowPurple}, transparent)`,
          bottom: "-10%",
          right: "-5%",
          animation: "breathScale 11s ease-in-out infinite 2s",
          opacity: 0.05,
        }}
      />

      {/* --- MAIN CONTENT --- */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 flex-1 flex flex-col">
        {/* Page Header */}
        <CinematicScrollReveal delay={0.1} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span
              className="w-8 h-1 rounded-full shrink-0"
              style={{
                background: "linear-gradient(90deg,#06b6d4,#3b82f6)",
                boxShadow: "0 0 10px rgba(6,182,212,0.8)",
              }}
            />
            <h3 className="hf text-[13px] font-extrabold uppercase tracking-[0.2em]" style={{ color: t.text }}>
              Hardware Components
            </h3>
            <span
              className="w-8 h-1 rounded-full shrink-0"
              style={{
                background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
                boxShadow: "0 0 10px rgba(6,182,212,0.8)",
              }}
            />
          </div>
          <h1
            className={`hf text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-none tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r ${
              isDark
                ? "from-[#06b6d4] via-[#3b82f6] to-[#7c3aed]"
                : "from-[#0891b2] via-[#2563eb] to-[#7c3aed]"
            }`}
          >
            {title || `Premium ${categoryName.toUpperCase()}`}
          </h1>
          <p
            className="max-w-2xl mx-auto text-base sm:text-lg font-medium leading-relaxed"
            style={{ color: t.textSecondary }}
          >
            {description ||
              `Upgrade your setup with our top-tier ${categoryName} components. Discover high performance, reliability, and the latest technology.`}
          </p>
        </CinematicScrollReveal>

        {/* Filter Navbar */}
        <div className="mb-10 relative z-30">
          <FilterNavbar 
            products={categoryProducts as any} 
            onFilterChange={handleFilterChange as any} 
          />
        </div>

        {/* Product Grid Area */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-10 mb-16 relative z-20">
            {currentProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative z-10 hover:z-50"
              >
                <HardwareProductCard
                  product={product}
                  index={0}
                  onQuickView={(p) => router.push(`/hardware/${p.id}`)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center flex-1 relative z-20"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ background: t.cardBg, border: `1px solid ${t.borderLight}` }}
            >
              <FontAwesomeIcon icon={faBoxOpen} className="text-4xl" style={{ color: t.textSubtle }} />
            </div>
            <h3 className="text-2xl font-bold hf mb-2" style={{ color: t.text }}>
              No components found
            </h3>
            <p className="text-sm font-medium max-w-md" style={{ color: t.textSecondary }}>
              We couldn't find any {categoryName} hardware matching your current filters. Try adjusting your search.
            </p>
          </motion.div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-auto pt-10 flex justify-center items-center gap-3 relative z-20">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: t.cardBg, border: `1px solid ${t.borderLight}`, color: t.text }}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className="w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300"
                    style={{
                      background: isActive ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : t.cardBg,
                      border: `1px solid ${isActive ? "transparent" : t.borderLight}`,
                      color: isActive ? "#fff" : t.textSecondary,
                      boxShadow: isActive ? "0 4px 14px rgba(6,182,212,0.3)" : "none",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: t.cardBg, border: `1px solid ${t.borderLight}`, color: t.text }}
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}