// app/actions/products.ts
"use server";

import { 
  getLaptopsFromDb, 
  getHardwareFromDb, 
  getLaptopById, 
  getHardwareById 
} from "@/lib/supabase-service";
import type { Product } from "@/lib/laptop-schema";
import type { HardwareProduct } from "@/lib/hardware-schema";

// 1. Server Action لجلب كل اللابتوبات
export async function fetchLaptopsAction(): Promise<Product[]> {
  return await getLaptopsFromDb();
}

// 2. Server Action لجلب كل قطع الهاردوير
export async function fetchHardwareAction(): Promise<HardwareProduct[]> {
  return await getHardwareFromDb();
}

// 3. Server Action لجلب لابتوب محدد بمعرف
export async function fetchLaptopByIdAction(id: string): Promise<Product | null> {
  return await getLaptopById(id);
}

// 4. Server Action لجلب قطعة هاردوير محددة بمعرف
export async function fetchHardwareByIdAction(id: string): Promise<HardwareProduct | null> {
  return await getHardwareById(id);
}
