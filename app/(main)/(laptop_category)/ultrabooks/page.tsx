// app/(main)/(laptop_category)/ultrabooks/page.tsx
import CategoryPage from "@/components/LaptopCategoryPage";

export default function UltraBooksLaptopsPage() {
  return (
    <CategoryPage 
      categoryName="Ultrabooks" 
      title="Compact Laptops" 
      description="Lightweight and portable laptops perfect for travel and everyday use."
    />
  );
}