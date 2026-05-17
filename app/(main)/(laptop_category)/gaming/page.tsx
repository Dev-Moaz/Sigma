// app/(main)/(laptop_category)/gaming/page.tsx
import CategoryPage from "@/components/LaptopCategoryPage";

export default function GamingLaptopsPage() {
  return (
    <CategoryPage 
      categoryName="Gaming" 
      title="Ultimate Gaming Rigs" 
      description="Dominate the leaderboard with our top-tier gaming laptops featuring high refresh rate displays and RTX GPUs."
    />
  );
}