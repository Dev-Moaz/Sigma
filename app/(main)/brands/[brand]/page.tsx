import BrandPage from "@/components/BrandPage";

// في Next.js 16، الـ params يجب أن تكون Promise
interface PageProps {
  params: Promise<{
    brand: string;
  }>;
}

export default async function DynamicBrandPage({ params }: PageProps) {
  // 1. ننتظر فك تشفير الـ params (مهم جداً في Next 16)
  const resolvedParams = await params;
  
  // 2. نستخرج اسم الماركة
  const decodedBrand = decodeURIComponent(resolvedParams.brand);
  
  // 3. نحول أول حرف لـ Capital (مثلاً asus تصبح Asus)
  const formattedBrandName = decodedBrand.charAt(0).toUpperCase() + decodedBrand.slice(1);

  return (
    <BrandPage 
      brandName={formattedBrandName} 
      title={`${formattedBrandName} Premium Laptops`}
      description={`Browse our complete lineup of ${formattedBrandName} machines. Filter by specs, price, and find your perfect match.`}
    />
  );
}