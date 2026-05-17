// app/(main)/(laptop_category)/business/page.tsx
import CategoryPage from "@/components/LaptopCategoryPage";

export default function BusinessLaptopsPage() {
  return (
    <CategoryPage 
      categoryName="Business" 
      title="Professional Laptops" 
      description="Sleek, secure, and powerful laptops designed for productivity and professionals on the go."
    />
  );
}