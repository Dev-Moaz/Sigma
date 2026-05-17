// store/useAppStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { THEME } from "@/lib/theme";
import type { Theme, ThemeColors } from "@/lib/theme";

/* ─── Types ─────────────────────────────────────────── */

interface ThemeSlice {
  theme:       Theme;
  toggleTheme: () => void;
  _applyTheme: (theme: Theme) => void;  // internal
  // ❌ حُذف: t و isDark — بيتحسبوا دلوقتي في useTheme selector مباشرةً
  //    ده بيضمن إنهم دايماً متزامنين مع theme، حتى بعد الـ rehydration
}

interface CartItem {
  id:     string;
  name:   string;
  price:  number;
  qty:    number;
  image?: string;
}

interface CartSlice {
  cartItems:      CartItem[];
  cartCount:      number;
  cartTotal:      number;
  addToCart:      (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart:      () => void;
}

interface WishlistSlice {
  wishIds:    string[];
  wishCount:  number;
  toggleWish: (id: string) => void;
}

interface CompareSlice {
  compareIds:    string[];
  compareCount:  number;
  toggleCompare: (id: string) => void;
  clearCompare:  () => void;
}

type AppState = ThemeSlice & CartSlice & WishlistSlice & CompareSlice;

/* ─── Helpers ───────────────────────────────────────── */

function applyThemeToDom(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

function calcCartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

function calcCartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/* ─── Store ─────────────────────────────────────────── */

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({

      /* ── Theme Slice ──────────────────────────────── */
      theme: "dark",
      // ❌ حُذف من هنا: t: THEME.dark
      // ❌ حُذف من هنا: isDark: true
      // ✅ السبب: هما derived values — بيتحسبوا في useTheme selector
      //    بحيث يكونوا دايماً = THEME[theme] و theme === "dark"
      //    ومحتاجش sync يدوي أو onRehydrateStorage يصلحهم

      _applyTheme: (theme: Theme) => {
        applyThemeToDom(theme);
        set({ theme });
        // ❌ حُذف: set({ theme, isDark, t }) — مش محتاجينهم هنا بعد كده
      },

      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        get()._applyTheme(next);
      },

      /* ── Cart Slice ───────────────────────────────── */
      cartItems: [],
      cartCount: 0,
      cartTotal: 0,

      addToCart: (item, qty = 1) => {
        const current  = get().cartItems;
        const existing = current.find((i) => i.id === item.id);

        const updated: CartItem[] = existing
          ? current.map((i) => i.id === item.id ? { ...i, qty: i.qty + qty } : i)
          : [...current, { ...item, qty }];

        set({
          cartItems: updated,
          cartCount: calcCartCount(updated),
          cartTotal: calcCartTotal(updated),
        });
      },

      removeFromCart: (id) => {
        const updated = get().cartItems.filter((i) => i.id !== id);
        set({
          cartItems: updated,
          cartCount: calcCartCount(updated),
          cartTotal: calcCartTotal(updated),
        });
      },

      clearCart: () => set({ cartItems: [], cartCount: 0, cartTotal: 0 }),

      /* ── Wishlist Slice ───────────────────────────── */
      wishIds:   [],
      wishCount: 0,

      toggleWish: (id) => {
        const current = get().wishIds;
        const updated  = current.includes(id)
          ? current.filter((w) => w !== id)
          : [...current, id];
        set({ wishIds: updated, wishCount: updated.length });
      },

      /* ── Compare Slice ────────────────────────────── */
      compareIds:   [],
      compareCount: 0,

      toggleCompare: (id) => {
        const current = get().compareIds;
        const exists  = current.includes(id);

        let updated: string[];
        if (exists) {
          updated = current.filter((cid) => cid !== id);
        } else {
          // Limit to 4 items
          if (current.length >= 4) return;
          updated = [...current, id];
        }

        set({ compareIds: updated, compareCount: updated.length });
      },

      clearCompare: () => set({ compareIds: [], compareCount: 0 }),
    }),

    {
      name:    "sigma-app",
      storage: createJSONStorage(() => localStorage),

      partialize: (s) => ({
        theme:      s.theme,
        cartItems:  s.cartItems,
        cartCount:  s.cartCount,
        cartTotal:  s.cartTotal,
        wishIds:    s.wishIds,
        wishCount:  s.wishCount,
        compareIds: s.compareIds,
      }),

      // ✅ بقى بسيط — بس نطبق الـ theme على الـ DOM
      // t و isDark بيتحسبوا أوتوماتيك في useTheme من theme المتحفظ
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDom(state.theme);
        }
      },
    }
  )
);

/* ─── Typed Selectors ───────────────────────────────── */

export const useTheme = () => {
  const { theme, toggleTheme } = useAppStore(
    useShallow((s) => ({
      theme:       s.theme,
      toggleTheme: s.toggleTheme,
    }))
  );

  // بيتحسبوا هنا — مش بيتقروا من الـ store
  const isDark = theme === "dark";
  const t: ThemeColors = THEME[theme];

  return { theme, t, isDark, toggleTheme };
};

export const useCart = () =>
  useAppStore(
    useShallow((s) => ({
      cartItems:      s.cartItems,
      cartCount:      s.cartCount,
      cartTotal:      s.cartTotal,
      addToCart:      s.addToCart,
      removeFromCart: s.removeFromCart,
      clearCart:      s.clearCart,
    }))
  );

export const useWishlist = () =>
  useAppStore(
    useShallow((s) => ({
      wishIds:    s.wishIds,
      wishCount:  s.wishCount,
      toggleWish: s.toggleWish,
    }))
  );

export const useCompare = () =>
  useAppStore(
    useShallow((s) => ({
      compareIds:    s.compareIds,
      compareCount:  s.compareCount,
      toggleCompare: s.toggleCompare,
      clearCompare:  s.clearCompare,
    }))
  );

/*
 * ──────────────────────────────────────────────────────
 * استخدام isWished في الـ components:
 *
 *   const { wishIds, toggleWish } = useWishlist();
 *   const isWished = wishIds.includes(productId);
 *
 * ──────────────────────────────────────────────────────
 */