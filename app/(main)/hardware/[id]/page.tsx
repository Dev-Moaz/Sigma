// app/(main)/hardware/[id]/page.tsx
import { notFound } from "next/navigation";
import HardwareProductDetailPage from "@/components/HardwareProductDetailPage";
import { fetchHardwareByIdAction } from "@/app/actions/products";

// 🌟 سطر منع التجميد الاستاتيكي لضمان ظهور قطع الهاردوير الجديدة فوراً عند زيارتها
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HardwarePageProps {
  params: Promise<{ id: string }>;
}

export default async function HardwarePage({ params }: HardwarePageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  // البحث عن قطعة الهاردوير حياً في قاعدة بيانات Supabase
  const product = await fetchHardwareByIdAction(decodedId);

  if (!product) {
    notFound();
  }

  return <HardwareProductDetailPage product={product} />;
}