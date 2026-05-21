/**
 * سكريبت ترحيل البيانات (Data Migration Script)
 * هذا السكريبت يقرأ البيانات من ملفات JSON المحلية ويقوم بتهيئتها ورفعها لـ Supabase.
 * يمكنك تشغيله محلياً عبر سطر الأوامر بعد ملء متغيرات البيئة.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// تحميل البيانات المحلية
const laptopsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/laptops.json'), 'utf8'));
const hardwareData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/hardware.json'), 'utf8'));

// يرجى استبدال القيم هنا أو استخدام ملف env.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SUPABASE_SERVICE_ROLE_KEY";

if (SUPABASE_URL === "YOUR_SUPABASE_URL" || SUPABASE_SERVICE_ROLE_KEY === "YOUR_SUPABASE_SERVICE_ROLE_KEY") {
  console.log("⚠️ يرجى ضبط المتغيرات NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY لتشغيل الترحيل.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrate() {
  console.log("🚀 جاري البدء في ترحيل البيانات إلى Supabase...");

  // 1. ترحيل أجهزة اللابتوب (Products)
  console.log("💻 جاري ترحيل اللابتوبات (Products)...");
  for (const item of laptopsData) {
    const formattedProduct = {
      id: item.id,
      name: item.name,
      brand: item.brand,
      tagline: item.tagline || "",
      price: item.price,
      original_price: item.originalPrice || null,
      category: item.category,
      sub_category: item.subCategory || "",
      rating: item.rating || 4.5,
      review_count: item.reviewCount || 0,
      is_deal: item.isDeal || false,
      images: item.images || [item.image].filter(Boolean),
      badge: item.badge || null,
      specs: JSON.stringify(item.specs || []),
      technical_metadata: JSON.stringify(item.technical_metadata || {}),
      color_variants: JSON.stringify(item.colorVariants || []),
      stock: item.stock || 5,
      description: item.description || "",
      features: item.features || []
    };

    const { error } = await supabase.from('products').upsert(formattedProduct);
    if (error) {
      console.error(`❌ فشل ترحيل اللابتوب: ${item.name}`, error.message);
    } else {
      console.log(`✅ تم ترحيل اللابتوب بنجاح: ${item.name}`);
    }
  }

  // 2. ترحيل قطع الهاردوير (Hardware)
  console.log("🔌 جاري ترحيل قطع الهاردوير (Hardware)...");
  for (const item of hardwareData) {
    const formattedHardware = {
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      discount_price: item.discountPrice || null,
      stock: item.stock || 5,
      images: item.images || [],
      rating: item.rating || 4.5,
      reviews: item.reviews || 0,
      description: item.description || "",
      is_new: item.isNew || false,
      is_deal: item.isDeal || false,
      category: item.category,
      specs: JSON.stringify(item.specs || {})
    };

    const { error } = await supabase.from('hardware').upsert(formattedHardware);
    if (error) {
      console.error(`❌ فشل ترحيل قطعة الهاردوير: ${item.name}`, error.message);
    } else {
      console.log(`✅ تم ترحيل قطعة الهاردوير بنجاح: ${item.name}`);
    }
  }

  console.log("🎉 اكتملت عملية الترحيل بنجاح تام!");
}

migrate();
