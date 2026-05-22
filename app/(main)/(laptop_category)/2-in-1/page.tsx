// app/(main)/(laptop_category)/2-in-1/page.tsx
import { fetchLaptopsAction } from "@/app/actions/products";
import CategoryPage from "@/components/LaptopCategoryPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TwoinOneLaptopsPage() {
  const laptops = await fetchLaptopsAction();
  return (
    <CategoryPage 
      initialLaptops={laptops}
      categoryName="2-in-1" 
      title="Convertible Laptops" 
      description="Versatile laptops that can be used as both a laptop and a tablet, perfect for flexibility and mobility."
    />
  );
}