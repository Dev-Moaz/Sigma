// app/(main)/compare/page.tsx
import { fetchLaptopsAction, fetchHardwareAction } from "@/app/actions/products";
import CompareClient from "./CompareClient";

// 🌟 منع التجميد الاستاتيكي لضمان مزامنة المقارنات الحية فوراً عند زيارة الصفحة
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ComparePage() {
  // جلب كافة اللابتوبات وقطع الهاردوير حياً من قاعدة البيانات بالتوازي
  const [laptops, hardware] = await Promise.all([
    fetchLaptopsAction(),
    fetchHardwareAction()
  ]);

  return (
    <CompareClient initialLaptops={laptops} initialHardware={hardware} />
  );
}