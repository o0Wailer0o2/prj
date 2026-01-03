"use client";

import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { ProductDTO } from "@/lib/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useNavigate } from "@tanstack/react-router";

interface CartItemProps {
  product: ProductDTO;
}

export function CartItem({ product }: CartItemProps) {
  const items = useCartStore((state) => state.items);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const navigate = useNavigate();

  const quantity = items.find((item) => item.productId === product.id)?.quantity || 0;

  const imageUrl = product.imageUrl || "/placeholder.svg";

  const handleProductClick = () => {
    navigate({ to: `/product/${product.id}` });
  };

  return (
    <Card className="bg-muted not-prose w-full flex-row gap-4 rounded-xl border-0 p-4 shadow-none">
      <div
        className="h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-white transition-opacity hover:opacity-80"
        onClick={handleProductClick}
      >
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 cursor-pointer" onClick={handleProductClick}>
            <CardDescription>{product.type}</CardDescription>
            <CardTitle className="hover:text-primary transition-colors">{product.title}</CardTitle>
          </div>

          <Button size="icon" variant="ghost" onClick={() => removeFromCart(product.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="bg-background text-foreground flex items-center rounded-lg border border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted h-8 w-8 rounded-lg"
              onClick={() => decrementQuantity(product.id)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted h-8 w-8 rounded-lg"
              onClick={() => incrementQuantity(product.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xl font-semibold">${(product.currentPrice * quantity).toFixed(2)}</p>
        </div>
      </div>
    </Card>
  );
}
