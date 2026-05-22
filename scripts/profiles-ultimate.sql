-- ══════════════════════════════════════════════════════════════════
-- THE ULTIMATE PROFILES SOLUTION — شغّل هذا مرة واحدة في Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- ═══ الخطوة 1: تنظيف كامل ═══
-- حذف أي Trigger قديم
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- حذف جدول profiles القديم
DROP TABLE IF EXISTS public.profiles CASCADE;

-- حذف كل المستخدمين اليتامى من auth (اختياري — أزل التعليق إذا تريد تنظيف كامل)
-- DELETE FROM auth.users;

-- ═══ الخطوة 2: إنشاء جدول profiles من جديد ═══
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    shipping_address TEXT,
    volt_points INTEGER DEFAULT 100 NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ═══ الخطوة 3: تفعيل RLS ═══
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ═══ الخطوة 4: كل السياسات المطلوبة ═══
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Allow insert to profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- ═══ الخطوة 5: THE MAGIC — Database Trigger ═══
-- هذه الدالة تنشئ ملف شخصي تلقائياً لأي مستخدم جديد يسجل في النظام
-- تعمل بصلاحيات postgres (SECURITY DEFINER) فلا تتأثر بالـ RLS أبداً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, volt_points, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        100,
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط الـ Trigger: كل ما يتم إنشاء مستخدم جديد في auth.users → يتم إنشاء profile تلقائياً
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════
-- تم! الآن أي مستخدم جديد سيحصل على profile تلقائياً بدون أي كود
-- ══════════════════════════════════════════════════════════════════
