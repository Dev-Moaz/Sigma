// app/(main)/hardware/[id]/page.tsx
import { notFound } from "next/navigation";
import HardwareProductDetailPage from "@/components/HardwareDetailPage";
import { fetchHardwareByIdAction } from "@/app/actions/products";

interface HardwarePageProps {
  params: Promise<{ id: string }>;
}

export default async function HardwarePage({ params }: HardwarePageProps) {
  // 1. فك الـ Promise الخاص بـ params (تحديث Next.js 15)
  const { id } = await params;
  
  // 2. فك تشفير الـ ID في حال كان يحتوي على مسافات أو رموز في الرابط
  const decodedId = decodeURIComponent(id);

  // 3. البحث عن قطعة الهاردوير في قاعدة البيانات (باستخدام قاعدة البيانات أو local JSON fallback)
  const product = await fetchHardwareByIdAction(decodedId);

  // 4. إذا لم يتم العثور على القطعة، نعرض صفحة 404
  if (!product) {
    notFound();
  }

  // 5. إذا وُجدت، نقوم بتمريرها لمكون العرض السينمائي
  return <HardwareProductDetailPage product={product} />;
}