// app/(main)/hardware/[id]/page.tsx
import { notFound } from "next/navigation";
import HardwareProductDetailPage from "@/components/HardwareDetailPage";
import type { HardwareProduct } from "@/lib/hardware-schema";

// 💡 تنويه: تأكد من مسار ملف الـ JSON الخاص بالهاردوير في مشروعك
import hardwareData from "@/data/hardware.json"; 

interface HardwarePageProps {
  params: Promise<{ id: string }>;
}

export default async function HardwarePage({ params }: HardwarePageProps) {
  // 1. فك الـ Promise الخاص بـ params (تحديث Next.js 15)
  const { id } = await params;
  
  // 2. فك تشفير الـ ID في حال كان يحتوي على مسافات أو رموز في الرابط
  const decodedId = decodeURIComponent(id);

  // 3. البحث عن قطعة الهاردوير في قاعدة البيانات (ملف JSON)
  const product = (hardwareData as HardwareProduct[]).find(
    (item) => item.id === decodedId
  );

  // 4. إذا لم يتم العثور على القطعة، نعرض صفحة 404
  if (!product) {
    notFound();
  }

  // 5. إذا وُجدت، نقوم بتمريرها لمكون العرض السينمائي
  return <HardwareProductDetailPage product={product} />;
}