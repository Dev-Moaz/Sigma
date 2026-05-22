// app/(main)/(laptop_category)/ultrabooks/page.tsx
import { fetchLaptopsAction } from "@/app/actions/products";
import CategoryPage from "@/components/LaptopCategoryPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UltraBooksLaptopsPage() {
  const laptops = await fetchLaptopsAction();
  return (
    <CategoryPage 
      initialLaptops={laptops}
      categoryName="Ultrabooks" 
      title="Compact Laptops" 
      description="Lightweight and portable laptops perfect for travel and everyday use."
    />
  );
}