"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthSync() {
  useEffect(() => {
    // 1. مزامنة فورية عند التحميل الأول للمكون
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncCookies(session);
    });

    // 2. الاستماع لأي تغيير في حالة المصادقة (دخول، خروج، تجديد التوكين)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      syncCookies(session);
    });

    function syncCookies(session: any) {
      if (session) {
        // تعيين التوكينز في الكوكيز لـ 7 أيام
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
      } else {
        // حذف الكوكيز عند تسجيل الخروج
        document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax; Secure`;
        document.cookie = `sb-refresh-token=; path=/; max-age=0; SameSite=Lax; Secure`;
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
