"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gksqcckmnguwbwzotyew.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrc3FjY2ttbmd1d2J3em90eWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzUxNjIsImV4cCI6MjA5NTAxMTE2Mn0.9f8FNRbJs_QdWrukhT7EsjYYPCicZTt7yON9gSATOh0";

async function getServerSupabase() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  if (accessToken && refreshToken) {
    try {
      await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (e) {
      console.error("Failed to set server auth session from cookies in admin:", e);
    }
  }

  return client;
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

// 6. إضافة منتج أو قطعة هاردوير جديدة (Add New Product / Hardware)
export async function addNewProductAction(type: 'laptop' | 'hardware', payload: any) {
  try {
    const supabase = await getServerSupabase();
    const isAdminCheck = await checkAdminRoleAction();
    if (!isAdminCheck.isAdmin) {
      return { success: false, error: "Unauthorized access" };
    }

    const table = type === "hardware" ? "hardware" : "products";
    const insertData = { ...payload };

    // توليد معرف فريد نصي (Slug) تلقائياً بناءً على اسم المنتج لحل مشكلة (id TEXT PRIMARY KEY)
    if (!insertData.id && insertData.name) {
      const slug = insertData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // استبدال الرموز والمسافات بـ -
        .replace(/(^-|-$)+/g, '');   // تنظيف أطراف الكلمة
      const rand = Math.random().toString(36).substring(2, 7); // إضافة 5 رموز لمنع تكرار الـ ID
      insertData.id = `${slug}-${rand}`;
    }

    // تحويل حقل الصور من نص مفصول بفواصل إلى مصفوفة نصوص
    if (insertData.images && typeof insertData.images === 'string') {
      insertData.images = insertData.images.split(',').map((img: string) => img.trim());
    } else if (!insertData.images || insertData.images.length === 0) {
      insertData.images = ["/placeholder.jpg"];
    }

    // تنسيق حقول الـ JSON المعقدة وتحويلها من نصوص إلى هياكل برمجية (Objects/Arrays)
    if (type === 'laptop') {
      if (typeof insertData.specs === 'string') {
        try { insertData.specs = JSON.parse(insertData.specs); } catch (e) { insertData.specs = []; }
      }
      if (typeof insertData.technical_metadata === 'string') {
        try { insertData.technical_metadata = JSON.parse(insertData.technical_metadata); } catch (e) { insertData.technical_metadata = {}; }
      }
      if (typeof insertData.color_variants === 'string') {
        try { insertData.color_variants = JSON.parse(insertData.color_variants); } catch (e) { insertData.color_variants = []; }
      }
    } else {
      if (typeof insertData.specs === 'string') {
        try { insertData.specs = JSON.parse(insertData.specs); } catch (e) { insertData.specs = {}; }
      }
    }

    const { data, error } = await supabase
      .from(table)
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("addNewProductAction error:", err);
    return { success: false, error: err.message || "Failed to add product" };
  }
}