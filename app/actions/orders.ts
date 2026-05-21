// app/actions/orders.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// دالة مساعدة لإنشاء Supabase client مخصص للـ Server Actions يدعم الـ Cookies لحفظ الجلسة
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

// دالة توليد رقم تتبع عشوائي فريد للطلب (مثال: SG-123456-XY)
function generateTrackingNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timestamp = Date.now().toString().slice(-4);
  return `SG-${timestamp}-${rand}`;
}

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingCity: string;
  shippingAddress: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    qty: number;
    _type?: 'laptop' | 'hardware'; // نوع المنتج
  }>;
  totalAmount: number;
}

// إنشاء طلب جديد في قاعدة البيانات وتحديث كميات المخزن
export async function createOrderAction(input: CheckoutInput) {
  try {
    const supabase = await getServerSupabase();
    
    // 1. الحصول على معرف المستخدم الحالي إن وجد (يمكن الشراء كمسجل أو كضيف)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user ? user.id : null;

    const trackingNumber = generateTrackingNumber();

    // 2. إدراج الطلب الرئيسي في جدول orders
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        customer_email: input.customerEmail,
        shipping_city: input.shippingCity,
        shipping_address: input.shippingAddress,
        total_amount: input.totalAmount,
        tracking_number: trackingNumber,
        status: "pending",
        payment_method: "COD"
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    const orderId = orderData.id;

    // 3. إدراج تفاصيل المنتجات داخل الطلب في جدول order_items
    const orderItemsToInsert = input.items.map(item => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      product_type: item._type || "laptop",
      quantity: item.qty,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      // محاولة حذف الطلب الرئيسي في حال فشل إدخال المنتجات (Rollback يدوي بسيط)
      await supabase.from("orders").delete().eq("id", orderId);
      throw new Error(`Failed to save order items: ${itemsError.message}`);
    }

    // 4. تحديث المخزون (Inventory Reduction) لكل منتج حياً في قاعدة البيانات
    for (const item of input.items) {
      const isLaptop = item._type !== "hardware";
      const table = isLaptop ? "products" : "hardware";
      
      // جلب المخزون الحالي أولاً
      const { data: currentProduct } = await supabase
        .from(table)
        .select("stock")
        .eq("id", item.id)
        .single();

      if (currentProduct) {
        const newStock = Math.max(0, currentProduct.stock - item.qty);
        
        // تحديث قيمة المخزون
        await supabase
          .from(table)
          .update({ stock: newStock })
          .eq("id", item.id);
      }
    }

    return { 
      success: true, 
      orderId, 
      trackingNumber,
      customerName: input.customerName,
      totalAmount: input.totalAmount
    };
  } catch (err: any) {
    console.error("Checkout Error:", err);
    return { success: false, error: err.message || "Something went wrong during checkout" };
  }
}

// جلب طلبات المستخدم الحالي لعرضها في لوحة تحكمه
export async function fetchUserOrdersAction() {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, orders };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
