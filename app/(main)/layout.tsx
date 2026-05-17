// ── app/(main)/layout.tsx ──
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CompareBar } from "@/components/ui/CompareBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1 pt-20 sm:pt-24">
        {children}
      </main>
      <CompareBar />
      <Footer />
    </div>
  );
}