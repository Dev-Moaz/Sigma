// app/(main)/brands/[brand]/page.tsx
import { fetchLaptopsAction } from "@/app/actions/products";
import BrandPage from "@/components/BrandPage";

// 🌟 سطر منع التجميد الاستاتيكي لضمان مزامنة البراندات حياً فوراً عند التصفح
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    brand: string;
  }>;
}

export default async function DynamicBrandPage({ params }: PageProps) {
  const resolvedParams = await params;
  const decodedBrand = decodeURIComponent(resolvedParams.brand);
  
  // تحويل أول حرف لـ Capital
  const formattedBrandName = decodedBrand.charAt(0).toUpperCase() + decodedBrand.slice(1);

  // جلب حقيقي وحي من السيرفر لكافة المنتجات في المتجر
  const laptops = await fetchLaptopsAction();

  return (
    <BrandPage 
      initialLaptops={laptops} // 🌟 تمرير المنتجات الحية
      brandName={formattedBrandName} 
      title={`${formattedBrandName} Premium Laptops`}
      description={`Browse our complete lineup of ${formattedBrandName} machines. Filter by specs, price, and find your perfect match.`}
    />
  );
}