-- إضافة جداول الطلبات وتتبع الشحنات لدورة الشراء الكاملة (COD Checkout Flow)

-- 1. جدول الطلبات (Orders Table)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'COD', -- Cash on Delivery
    total_amount DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    tracking_number TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول تفاصيل المنتجات داخل الطلب (Order Items Table)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT NOT NULL, -- يمكن أن يشير إلى لابتوب أو قطعة هاردوير
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL, -- 'laptop' أو 'hardware'
    quantity INTEGER NOT NULL DEFAULT 1,
    price DOUBLE PRECISION NOT NULL
);

-- 3. تفعيل الحماية والوصول الآمن (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4. السياسات الأمنية (Policies)
-- يمكن للمستخدمين المسجلين رؤية طلباتهم هم فقط
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- يسمح لأي مستخدم (مسجل أو ضيف) بإدراج طلب جديد (شراء)
CREATE POLICY "Anyone can create an order" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- يمكن للمستخدم رؤية تفاصيل المنتجات لطلباته هو فقط
CREATE POLICY "Users can view their own order items" 
ON public.order_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE public.orders.id = public.order_items.order_id 
        AND public.orders.user_id = auth.uid()
    )
);

-- يسمح بإدراج تفاصيل طلب جديد لأي عملية شراء
CREATE POLICY "Anyone can insert order items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);
