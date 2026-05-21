// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Client-side & general Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * دالة مساعدة للتحقق مما إذا كان قد تم تهيئة Supabase بالكامل بمفاتيح البيئة (Env variables).
 * إذا لم تكن المفاتيح متوفرة، سيعود الموقع تلقائياً لقراءة البيانات محلياً من ملفات الـ JSON
 * لضمان عدم توقف الـ Portfolio عن العمل مطلقاً وتحقيق أقصى درجات المرونة والاعتمادية.
 */
export const isSupabaseConfigured = (): boolean => {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-url.supabase.co";
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";
  return hasUrl && hasKey;
};
