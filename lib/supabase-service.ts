// lib/supabase-service.ts
import { supabase, isSupabaseConfigured } from "./supabase";
import type { Product, ProductCategory, ProductBadge } from "./laptop-schema";
import type { HardwareProduct, HardwareCategory } from "./hardware-schema";

// ─── محول البيانات من تنسيق قاعدة البيانات إلى التنسيق الداخلي للتطبيق (Adapters) ───

export function mapDbProductToSchema(dbItem: any): Product {
  return {
    id: dbItem.id,
    name: dbItem.name,
    brand: dbItem.brand,
    tagline: dbItem.tagline,
    price: dbItem.price,
    originalPrice: dbItem.original_price,
    category: dbItem.category as ProductCategory,
    subCategory: dbItem.sub_category,
    rating: dbItem.rating,
    reviewCount: dbItem.review_count,
    isDeal: dbItem.is_deal,
    images: dbItem.images,
    image: dbItem.images?.[0] || "",
    badge: dbItem.badge as ProductBadge,
    specs: typeof dbItem.specs === "string" ? JSON.parse(dbItem.specs) : dbItem.specs,
    technical_metadata: typeof dbItem.technical_metadata === "string" ? JSON.parse(dbItem.technical_metadata) : dbItem.technical_metadata,
    colorVariants: typeof dbItem.color_variants === "string" ? JSON.parse(dbItem.color_variants) : dbItem.color_variants,
    stock: dbItem.stock,
    description: dbItem.description,
    features: dbItem.features,
  };
}

export function mapDbHardwareToSchema(dbItem: any): HardwareProduct {
  return {
    id: dbItem.id,
    name: dbItem.name,
    brand: dbItem.brand,
    price: dbItem.price,
    discountPrice: dbItem.discount_price,
    stock: dbItem.stock,
    images: dbItem.images,
    rating: dbItem.rating,
    reviews: dbItem.reviews,
    description: dbItem.description,
    isNew: dbItem.is_new,
    isDeal: dbItem.is_deal,
    category: dbItem.category as any,
    specs: typeof dbItem.specs === "string" ? JSON.parse(dbItem.specs) : dbItem.specs,
  } as HardwareProduct;
}

// ─── دوال جلب البيانات مع ميزة الـ Fallback التلقائي في حال عدم تهيئة Supabase ───

// 1. جلب اللابتوبات (Products)
export async function getLaptopsFromDb(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    // Fallback لـ JSON المحلي إذا لم تكن قاعدة البيانات مهيأة
    const localData = await import("@/data/laptops.json");
    return localData.default as Product[];
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDbProductToSchema);
  } catch (err) {
    console.error("Supabase Fetch Error (Laptops), falling back to JSON:", err);
    const localData = await import("@/data/laptops.json");
    return localData.default as Product[];
  }
}

// 2. جلب قطع الهاردوير (Hardware)
export async function getHardwareFromDb(): Promise<HardwareProduct[]> {
  if (!isSupabaseConfigured()) {
    const localData = await import("@/data/hardware.json");
    return localData.default as HardwareProduct[];
  }

  try {
    const { data, error } = await supabase
      .from("hardware")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDbHardwareToSchema);
  } catch (err) {
    console.error("Supabase Fetch Error (Hardware), falling back to JSON:", err);
    const localData = await import("@/data/hardware.json");
    return localData.default as HardwareProduct[];
  }
}

// 3. جلب لابتوب محدد بمعرف (Single Laptop PDP)
export async function getLaptopById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    const localData = await import("@/data/laptops.json");
    const found = localData.default.find((p) => p.id === id);
    return found ? (found as Product) : null;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data ? mapDbProductToSchema(data) : null;
  } catch (err) {
    console.error(`Supabase Fetch Error (Laptop ID: ${id}), falling back to JSON:`, err);
    const localData = await import("@/data/laptops.json");
    const found = localData.default.find((p) => p.id === id);
    return found ? (found as Product) : null;
  }
}

// 4. جلب قطعة هاردوير محددة بمعرف (Single Hardware PDP)
export async function getHardwareById(id: string): Promise<HardwareProduct | null> {
  if (!isSupabaseConfigured()) {
    const localData = await import("@/data/hardware.json");
    const found = localData.default.find((p) => p.id === id);
    return found ? (found as HardwareProduct) : null;
  }

  try {
    const { data, error } = await supabase
      .from("hardware")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data ? mapDbHardwareToSchema(data) : null;
  } catch (err) {
    console.error(`Supabase Fetch Error (Hardware ID: ${id}), falling back to JSON:`, err);
    const localData = await import("@/data/hardware.json");
    const found = localData.default.find((p) => p.id === id);
    return found ? (found as HardwareProduct) : null;
  }
}
