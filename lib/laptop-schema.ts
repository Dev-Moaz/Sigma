// ─── laptop-schema.ts ────────────────────────────────────────────────────────
// Single source of truth لكل types المتعلقة بالمنتجات.
// كل component يستورد منه مباشرة — لا تعريفات مكررة في أي مكان.

export type ProductBadge = "NEW" | "HOT" | "SALE" | "LIMITED";
export type ProductCategory = "Gaming" | "Business" | "Ultrabooks" | "2-in-1";

export interface ProductSpec {
  label: string;      // ما يظهر في الـ HUD (مثلاً: "GPU")
  value: string;      // ما يظهر في الـ HUD (مثلاً: "RTX 5090")
  color: string;      // لون التوهج (Glow) الخاص بالـ Badge (مثلاً: "#76b900")
  raw_value: string;  // القيمة الخام للفلترة (مثلاً: "5090") — لا تظهر في الـ UI
}

export interface ColorVariant {
  name: string;
  hex: string;
}

export interface Product {
  image: string;
  id: string;
  name: string;
  brand: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  subCategory: string;        // مثل: "Workstations" أو "Thin & Light"
  rating: number;             // 0–5
  reviewCount: number;
  isDeal?: boolean;
  images: string[];
  badge?: ProductBadge;

  // الـ Specs التي تغذي الـ HUD Badges في ProductCard
  specs: ProductSpec[];

  // بيانات تقنية مخفية — تُستخدم فقط في الـ Filtering Engine
  technical_metadata: {
    gpu: string;
    cpu: string;
    ram_gb: number;
    storage_gb: number;
    screen_size: number;
    display_hz: number;       // ←  240Hz
    battery_hours: number;    // ←  18hr
    nvme_speed_gbs: number;  // ←  7GB/s
    connectivity?: string[]; // مثل: ["Wi-Fi 6E", "Bluetooth 5.2", "Thunderbolt 4"]
    vram_gb: number;
    gpu_tdp_watts: number;
    gpu_memory_type: string;    // "GDDR6X"
    cpu_cores: number; 
    cpu_threads: number;
    cpu_speed: number; // GHz
    display_type: string; // "IPS", "OLED", "Mini-LED"
    display_response_ms: number; // 1ms, 3ms, 5ms
  };

  colorVariants: ColorVariant[];
  stock: number;
  description: string;  // لصفحة المنتج (PDP)
  features: string[];   // Bullet points في الـ PDP
}