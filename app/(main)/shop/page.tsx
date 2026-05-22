// app/(main)/shop/page.tsx
import { fetchLaptopsAction } from "@/app/actions/products";
import ShopPageClient from "./shopPageClient";

// 🌟 إلغاء التجميد الاستاتيكي لجلب البيانات حياً من قاعدة البيانات عند كل زيارة
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
  // جلب البيانات حياً على السيرفر قبل تحميل الصفحة للزائر
  const laptops = await fetchLaptopsAction();

  return (
    <ShopPageClient initialLaptops={laptops} />
  );
}