// app/(main)/(laptop_category)/business/page.tsx
import { fetchLaptopsAction } from "@/app/actions/products";
import CategoryPage from "@/components/LaptopCategoryPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BusinessLaptopsPage() {
  const laptops = await fetchLaptopsAction();
  return (
    <CategoryPage 
      initialLaptops={laptops}
      categoryName="Business" 
      title="Professional Laptops" 
      description="Sleek, secure, and powerful laptops designed for productivity and professionals on the go."
    />
  );
}