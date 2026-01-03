// utils/cart/cart-calculation.ts
import type { CartItem } from "@/lib/types/cart";
import type { ProductDTO } from "@/lib/types/product";

export interface CartCalculations {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export function calculateCartSubtotal(
  products: ProductDTO[] | undefined,
  items: CartItem[]
): number {
  if (!products || products.length === 0) return 0;

  return products.reduce((sum, product) => {
    const item = items.find((i) => i.productId === product.id);
    return sum + product.currentPrice * (item?.quantity ?? 0);
  }, 0);
}

export function calculateCartTotal(
  products: ProductDTO[] | undefined,
  items: CartItem[]
): CartCalculations {
  const subtotal = calculateCartSubtotal(products, items);
  const tax = subtotal * 0.1;
  const deliveryFee = subtotal > 0 ? 5 : 0;

  return {
    subtotal,
    tax,
    deliveryFee,
    total: subtotal + tax + deliveryFee
  };
}
