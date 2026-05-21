// app/actions/admin.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgagfvcujuoujbtmqqom.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYWdmdmN1anVvdWpidG1xcW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTU1MjEsImV4cCI6MjA5NDg3MTUyMX0.mBZ-7vit3ruvRUmwDgM3oF4MkCmkM-pxkJ8ehv-4CFM";

async function getServerSupabase() {
  const cookieStore = await cookies();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
    },
    global: {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  });
}

// 1. التحقق من صلاحية المدير (Check Admin Role)
export async function checkAdminRoleAction() {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isAdmin: false };

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("Error fetching admin role:", error?.message);
      return { isAdmin: false };
    }

    return { isAdmin: data.role === "admin" };
  } catch (err) {
    console.error("checkAdminRoleAction error:", err);
    return { isAdmin: false };
  }
}

// 2. جلب جميع الطلبات للمدير (Fetch All Orders)
export async function fetchAdminOrdersAction() {
  try {
    const supabase = await getServerSupabase();
    const isAdminCheck = await checkAdminRoleAction();
    if (!isAdminCheck.isAdmin) {
      return { success: false, error: "Unauthorized access" };
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, orders };
  } catch (err: any) {
    console.error("fetchAdminOrdersAction error:", err);
    return { success: false, error: err.message || "Failed to fetch orders" };
  }
}

// 3. تحديث حالة الطلب (Update Order Status)
export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    const supabase = await getServerSupabase();
    const isAdminCheck = await checkAdminRoleAction();
    if (!isAdminCheck.isAdmin) {
      return { success: false, error: "Unauthorized access" };
    }

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("updateOrderStatusAction error:", err);
    return { success: false, error: err.message || "Failed to update order status" };
  }
}

// 4. جلب المخزون والمنتجات بالكامل للمدير (Fetch Admin Inventory)
export async function fetchAdminInventoryAction() {
  try {
    const supabase = await getServerSupabase();
    const isAdminCheck = await checkAdminRoleAction();
    if (!isAdminCheck.isAdmin) {
      return { success: false, error: "Unauthorized access" };
    }

    // جلب اللابتوبات وهاردوير بالتوازي
    const [laptopsRes, hardwareRes] = await Promise.all([
      supabase.from("products").select("id, name, brand, price, stock").order("name"),
      supabase.from("hardware").select("id, name, brand, price, stock").order("name")
    ]);

    if (laptopsRes.error) throw laptopsRes.error;
    if (hardwareRes.error) throw hardwareRes.error;

    return {
      success: true,
      laptops: laptopsRes.data || [],
      hardware: hardwareRes.data || []
    };
  } catch (err: any) {
    console.error("fetchAdminInventoryAction error:", err);
    return { success: false, error: err.message || "Failed to fetch inventory" };
  }
}

// 5. تعديل مخزون منتج (Update Product/Hardware Stock)
export async function updateProductStockAction(id: string, type: 'laptop' | 'hardware', stock: number) {
  try {
    const supabase = await getServerSupabase();
    const isAdminCheck = await checkAdminRoleAction();
    if (!isAdminCheck.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const table = type === "hardware" ? "hardware" : "products";
    const { error } = await supabase
      .from(table)
      .update({ stock })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("updateProductStockAction error:", err);
    return { success: false, error: err.message || "Failed to update stock" };
  }
}
