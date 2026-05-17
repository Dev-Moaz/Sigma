// ── app/layout.tsx ──
import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
}); 

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title:       "Sigma — Premium Laptops & PC Components",
  description: "Authorized reseller of 20+ leading brands. Gaming laptops, ultrabooks, CPUs, GPUs and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const s = JSON.parse(localStorage.getItem('sigma-app') || '{}');
                const theme = s?.state?.theme ?? 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch {}
            `,
          }}
        />
      </head>
      {/* 
        لاحظ أننا أزلنا Header و Footer و main.
        الـ body الآن يعرض الـ children مباشرة.
      */}
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}