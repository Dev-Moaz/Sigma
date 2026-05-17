// components/ui/Logo.tsx
"use client";

import { motion } from "framer-motion";
// Icons removed, using text symbol for Sigma
import { useTheme } from "@/store/useAppStore";
import Image from "next/image";

interface LogoProps {
  /**
   * "responsive" → header variant: w-9 sm:w-10 icon, text-lg sm:text-[22px]
   * "fixed"      → footer variant: w-10 icon, text-[22px]
   */
  variant?: "responsive" | "fixed";
}

export function Logo({ variant = "responsive" }: LogoProps) {
  const { t, isDark } = useTheme();

  const iconBox  = variant === "responsive" ? "h-10 sm:h-12" : "h-12";
  const shimmerDelay = variant === "responsive" ? 2.5 : 3;

  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={`relative flex items-center justify-center ${iconBox}`}>
        <Image
          src="/sigma-logo.png" 
          alt="Sigma Computer" 
          className="h-full w-auto object-contain transition-all duration-300"
          style={{ 
            // تقنية ذكية: قلب الألوان (لتحويل الأسود لأبيض) ثم تدوير الهيو (لإرجاع الأزرق لأصله)
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