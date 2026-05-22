-- ══════════════════════════════════════════════════════════════════
-- كل شيء متعلق بجدول الملفات الشخصية (Profiles) — نسخه وتشغيله مرة واحدة
-- ══════════════════════════════════════════════════════════════════

-- 1. حذف الجدول القديم إن وجد (لإعادة البناء من الصفر)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. إنشاء جدول الملفات الشخصية
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    shipping_address TEXT,
    volt_points INTEGER DEFAULT 100 NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. تفعيل حماية الصفوف (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. سياسة القراءة: المستخدم يرى ملفه الشخصي فقط
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 5. سياسة التعديل: المستخدم يعدل ملفه الشخصي فقط
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 6. سياسة الإدراج: السماح بإنشاء ملف شخصي عند التسجيل
CREATE POLICY "Allow insert to profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);
