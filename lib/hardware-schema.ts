// lib/hardware-schema.ts

// 1. الأنواع الأساسية المشتركة بين كل قطع الهاردوير
export interface BaseHardwareProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  rating: number;
  reviews: number;
  description: string;
  isNew?: boolean;
  isDeal?: boolean;
}

// 2. مواصفات المعالج (CPU)
export interface CPUProduct extends BaseHardwareProduct {
  category: "CPU";
  specs: {
    socket: string; // مثال: "AM5", "LGA1700"
    cores: number;
    threads: number;
    baseClock: string; // مثال: "3.4 GHz"
    boostClock: string; // مثال: "5.4 GHz"
    tdp: number; // بالواط (Watts)
    integratedGraphics?: boolean;
  };
}

// 3. مواصفات كرت الشاشة (GPU)
export interface GPUProduct extends BaseHardwareProduct {
  category: "GPU";
  specs: {
    chipset: string; // مثال: "RTX 4090", "RX 7900 XTX"
    vram: string; // مثال: "24GB GDDR6X"
    coreClock: string;
    length: number; // بالطول ملم (مهم لمعرفة إذا كان يناسب الكيسة)
    tdp: number;
    recommendedPSU: number; // الباور سبلاي المقترح بالواط
  };
}

// 4. مواصفات اللوحة الأم (Motherboard)
export interface MotherboardProduct extends BaseHardwareProduct {
  category: "Motherboard";
  specs: {
    socket: string; // يجب أن يتطابق مع المعالج
    formFactor: "ATX" | "Micro-ATX" | "Mini-ITX" | "E-ATX";
    chipset: string; // مثال: "Z790", "B650"
    memorySlots: number;
    maxMemory: string; // مثال: "128GB"
    wifiIncluded: boolean;
  };
}

// 5. مواصفات الرامات (RAM)
export interface RAMProduct extends BaseHardwareProduct {
  category: "RAM";
  specs: {
    type: "DDR4" | "DDR5";
    capacity: string; // مثال: "32GB (2x16GB)"
    speed: number; // بالميجاهرتز (MHz)
    casLatency: number; // مثال: 30 أو 32
    rgb: boolean;
  };
}

// 6. مواصفات التخزين (SSD / HDD / NVMe)
// دمجناهم تحت قسم "Storage" مع تحديد النوع الدقيق
export interface StorageProduct extends BaseHardwareProduct {
  category: "Storage";
  specs: {
    storageType: "HDD" | "SSD" | "NVMe";
    capacity: string; // مثال: "2TB", "500GB"
    interface: string; // مثال: "PCIe 4.0 x4", "SATA III"
    formFactor: string; // مثال: "M.2 2280", "2.5 inch", "3.5 inch"
    readSpeed?: string; // مثال: "7300 MB/s" (مهم لـ NVMe)
    writeSpeed?: string; // مثال: "6000 MB/s"
  };
}

// 7. مواصفات الكيسة (Case)
export interface CaseProduct extends BaseHardwareProduct {
  category: "Case";
  specs: {
    type: "Full Tower" | "Mid Tower" | "Mini Tower";
    color: string;
    motherboardSupport: string[]; // مثال: ["ATX", "Micro-ATX", "Mini-ITX"]
    includedFans: number;
    sidePanel: "Tempered Glass" | "Mesh" | "Solid";
  };
}

// 8. مواصفات الشاشة (Monitor)
export interface MonitorProduct extends BaseHardwareProduct {
  category: "Monitor";
  specs: {
    size: number; // بالبوصة (مثال: 27)
    resolution: string; // مثال: "2560 x 1440"
    refreshRate: number; // بالهرتز (مثال: 144)
    panelType: "IPS" | "VA" | "TN" | "OLED";
    responseTime: string; // مثال: "1ms"
    curved: boolean;
  };
}

// 9. تجميع كل الأنواع في نوع واحد رئيسي
export type HardwareProduct =
  | CPUProduct
  | GPUProduct
  | MotherboardProduct
  | RAMProduct
  | StorageProduct
  | CaseProduct
  | MonitorProduct;

// نوع مساعد لاستخراج الأقسام فقط (لتسهيل عمل الـ Navbar أو الفلاتر)
export type HardwareCategory = HardwareProduct["category"];