// app/(main)/hardware/[category]/page.tsx

import CategoryPage from "@/components/HardwareCategoryPage";

// ✅ الحل 1: اجعل الـ component async (الأبسط والمفضّل)
export default async function HardwareCategoryRoute({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params; // ← await هنا هو المفتاح
  const categoryName = decodeURIComponent(category);

  return (
    <CategoryPage
      categoryName={categoryName}
      title={`Shop Best ${categoryName.toUpperCase()}`}
      description={`Find the perfect ${categoryName} for your next PC build or upgrade.`}
    />
  );
}