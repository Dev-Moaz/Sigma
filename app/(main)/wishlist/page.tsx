// app/(main)/wishlist/page.tsx
import { fetchLaptopsAction, fetchHardwareAction } from "@/app/actions/products";
import WishlistClient from "./WishlistClient";

// 🌟 إلغاء التجميد الاستاتيكي لضمان فحص وتحديث المفضلة الحية فوراً عند التصفح
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WishlistPage() {
  // جلب كافة اللابتوبات وقطع الهاردوير حياً من قاعدة البيانات بالتوازي
  const [laptops, hardware] = await Promise.all([
    fetchLaptopsAction(),
    fetchHardwareAction()
  ]);

  return (
    <WishlistClient initialLaptops={laptops} initialHardware={hardware} />
  );
}