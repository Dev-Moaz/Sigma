-- 1. جدول المنتجات (Laptops)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    tagline TEXT,
    price DOUBLE PRECISION NOT NULL,
    original_price DOUBLE PRECISION,
    category TEXT NOT NULL DEFAULT 'Gaming',
    sub_category TEXT,
    rating DOUBLE PRECISION DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    is_deal BOOLEAN DEFAULT false,
    images TEXT[] NOT NULL DEFAULT '{}',
    badge TEXT,
    specs JSONB NOT NULL DEFAULT '[]',
    technical_metadata JSONB NOT NULL DEFAULT '{}',
    color_variants JSONB NOT NULL DEFAULT '[]',
    stock INTEGER NOT NULL DEFAULT 5,
    description TEXT,
    features TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول قطع الهاردوير (Hardware Components)
CREATE TABLE IF NOT EXISTS public.hardware (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    discount_price DOUBLE PRECISION,
    stock INTEGER NOT NULL DEFAULT 5,
    images TEXT[] NOT NULL DEFAULT '{}',
    rating DOUBLE PRECISION DEFAULT 4.5,
    reviews INTEGER DEFAULT 0,
    description TEXT,
    is_new BOOLEAN DEFAULT false,
    is_deal BOOLEAN DEFAULT false,
    category TEXT NOT NULL, -- CPU, GPU, RAM, etc.
    specs JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. تفعيل الحماية والوصول العام للقراءة (Enable Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware ENABLE ROW LEVEL SECURITY;

-- 4. سياسات القراءة العامة للجميع (Public Read Policies)
CREATE POLICY "Allow public read access on products" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access on hardware" 
ON public.hardware FOR SELECT 
USING (true);

-- 5. جدول الملفات الشخصية للمستخدمين (User Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    shipping_address TEXT,
    volt_points INTEGER DEFAULT 100 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- تفعيل الـ RLS على الـ Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- سياسات الملفات الشخصية (الوصول للملف الخاص فقط)
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
