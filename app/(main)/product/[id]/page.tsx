// app/product/[id]/page.tsx

import { notFound } from "next/navigation";
import { fetchLaptopByIdAction } from "@/app/actions/products";
import ProductDetailPage from "@/components/ProductDetailPage"; 

// 1. جعلنا الـ Component من نوع async والـ params من نوع Promise
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. عمل await لاستخراج الـ id بشكل آمن (متوافق مع Next.js 15+)
  const resolvedParams = await params;
  
  // 3. فك التشفير في حال كان المتصفح أضاف رموز (مثال: مسافات %20)
  const productId = decodeURIComponent(resolvedParams.id);

  // 4. البحث عن المنتج بناءً على الـ ID الدقيق (باستخدام قاعدة البيانات أو local JSON fallback)
  const product = await fetchLaptopByIdAction(productId);
  // 5. إذا لم يتم العثور عليه، نعرض 404
  if (!product) {
    notFound();
  }

  // 6. تمرير المنتج وعرض الصفحة الأسطورية
  return <ProductDetailPage product={product} />;
}