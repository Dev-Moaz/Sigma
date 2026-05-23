// components/ui/Logo.tsx
"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/store/useAppStore";

interface LogoProps {
  /**
   * "responsive" → header variant: ارتفاع أكبر للتجاوب بوضوح
   * "fixed"      → footer variant: ارتفاع مخصص وثابت للفوتر
   */
  variant?: "responsive" | "fixed";
}

export function Logo({ variant = "responsive" }: LogoProps) {
  const { isDark } = useTheme();

  // زيادة حجم الارتفاع لتبدو تفاصيل وشعار اللوجو واضحة ومقروءة بالكامل
  const iconBox = variant === "responsive" ? "h-22 sm:h-26" : "h-26";

  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={`relative flex items-center justify-center ${iconBox}`}>
        <img
          src="/alfernsia.png" 
          alt="Alfernsia Store" 
          className="h-full w-auto object-contain transition-all duration-300"
          style={{ 
            // تقنية ذكية: قلب الألوان (لتحويل الأسود لأبيض في الـ Dark Mode) ثم تدوير الهيو (لإرجاع الأزرق لأصله)
            filter: isDark ? "invert(1) hue-rotate(180deg) brightness(1.2)" : "none"
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </motion.div>
  );
}