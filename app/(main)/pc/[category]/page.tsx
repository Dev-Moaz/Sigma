// app/(main)/hardware/[category]/page.tsx
import { fetchHardwareAction } from "@/app/actions/products";
import CategoryPage from "@/components/HardwareCategoryPage";

// 🌟 منع التجميد الاستاتيكي لضمان فحص وتحديث الهاردوير المضاف حديثاً فوراً
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HardwareCategoryRoute({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category);

  // جلب حقيقي وحي من السيرفر لكافة قطع الهاردوير في المتجر
  const hardware = await fetchHardwareAction();

  return (
    <CategoryPage
      initialHardware={hardware} // 🌟 تمرير مصفوفة قطع الهاردوير الحية
      categoryName={categoryName}
      title={`Shop Best ${categoryName.toUpperCase()}`}
      description={`Find the perfect ${categoryName} for your next PC build or upgrade.`}
    />
  );
}