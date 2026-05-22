// app/(main)/(laptop_category)/gaming/page.tsx
import { fetchLaptopsAction } from "@/app/actions/products";
import CategoryPage from "@/components/LaptopCategoryPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GamingLaptopsPage() {
  const laptops = await fetchLaptopsAction();
  return (
    <CategoryPage 
      initialLaptops={laptops}
      categoryName="Gaming" 
      title="Ultimate Gaming Rigs" 
      description="Dominate the leaderboard with our top-tier gaming laptops featuring high refresh rate displays and RTX GPUs."
    />
  );
}