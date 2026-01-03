import type { CartItem } from "@/lib/types/cart";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStore {
  items: CartItem[];
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  incrementQuantity: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  clearCart: () => void;
  getQuantity: (productId: number) => number;
  getTotalItems: () => number;
  getProductIds: () => number[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (productId: number) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === productId);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
              )
            };
          }
          return {
            items: [...state.items, { productId, quantity: 1 }]
          };
        }),

      removeFromCart: (productId: number) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId)
        })),

      updateQuantity: (productId: number, quantity: number) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          )
        })),

      incrementQuantity: (productId: number) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
          )
        })),

      decrementQuantity: (productId: number) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        })),

      clearCart: () => set({ items: [] }),

      getQuantity: (productId: number) => {
        const item = get().items.find((item) => item.productId === productId);
        return item?.quantity || 0;
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getProductIds: () => {
        return get().items.map((item) => item.productId);
      }
    }),
    {
      name: "cart-storage"
    }
  )
);
