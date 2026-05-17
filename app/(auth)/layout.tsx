// app/(auth)/layout.tsx
"use client";

import React from "react";
import { useTheme } from "@/store/useAppStore";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTheme();

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden" 
      style={{ backgroundColor: t.bg }}
    >
      {/* 
          هذا الـ layout يضمن أن الصفحة الابنة (LoginPage) 
          تستحوذ على كامل عرض وطول الشاشة 
          بدون أي Margins أو Paddings من الـ Root Layout.
      */}
      {children}
    </div>
  );
}