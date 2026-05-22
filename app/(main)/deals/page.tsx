// app/(main)/deals/page.tsx
import { fetchLaptopsAction, fetchHardwareAction } from "@/app/actions/products";
import DealsPageClient from "./DealsPageClient";

// 🌟 إلغاء التجميد الاستاتيكي لجلب العروض حياً من قاعدة البيانات عند كل زيارة
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DealsPage() {
  // جلب البيانات من جدول اللابتوبات وجدول الهاردوير بالتوازي لسرعة خارقة
  const [laptops, hardware] = await Promise.all([
    fetchLaptopsAction(),
    fetchHardwareAction()
  ]);

  // تصفية الصفقات الحية التي تمتلك علم isDeal داخل الخادم وتقليص حجم البيانات المرسلة
  const laptopDeals = laptops.filter(l => l.isDeal);
  const hardwareDeals = hardware.filter(h => h.isDeal);
  
  const initialDeals = [...laptopDeals, ...hardwareDeals];

  return (
    <DealsPageClient initialDeals={initialDeals} />
  );
}