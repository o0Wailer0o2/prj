"use client";

import type { ProductDTO } from "@/lib/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { ImageZoom } from "@/components/ui/image-zoom";
import { ImageWithFallback } from "@/components/image-with-fallback";

interface ProductCardProps {
  product: ProductDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);

  const discountPercent =
    product.originalValue > product.currentPrice
      ? Math.round(((product.originalValue - product.currentPrice) / product.originalValue) * 100)
      : 0;

  const handleAddToCart = async () => {
    if (isAdded) return;

    try {
      setIsAdded(true);
      addToCart(product.id);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setTimeout(() => setIsAdded(false), 1000);
    }
  };

  const imageUrl = product.imageUrl || "/placeholder.svg";

  return (
    <Card className="group border-border flex h-[640px] flex-col overflow-hidden py-2 transition-all hover:shadow-lg">
      {/* CLICKABLE MAIN AREA */}
      <Link to="/product/$id" params={{ id: String(product.id) }} className="flex flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col p-0">
          {/* IMAGE */}
          <div className="from-muted to-background relative h-64 overflow-hidden bg-gradient-to-b">
            <ImageWithFallback
              src={imageUrl ?? "/placeholder.svg"}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* DISCOUNT */}
            {discountPercent > 0 && (
              <div className="absolute top-3 left-3 rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-semibold text-orange-700 dark:bg-orange-900 dark:text-orange-100">
                -{discountPercent}%
              </div>
            )}

            {/* STOCK BADGE */}
            <div className="absolute right-3 bottom-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                  product.stock > 0
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                }`}
              >
                {product.stock > 0 ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    {product.stock} in stock
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Out of stock
                  </>
                )}
              </span>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex flex-1 flex-col p-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {product.type}
            </p>

            <h3 className="mt-2 line-clamp-2 font-serif text-lg font-semibold">{product.title}</h3>

            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{product.description}</p>

            {/* RATING */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">
                {product.averageRating.toFixed(1)}
              </span>
            </div>

            {/* PRICE */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">${product.currentPrice.toFixed(2)}</span>

              {product.originalValue > product.currentPrice && (
                <span className="text-muted-foreground text-sm line-through">
                  ${product.originalValue.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      {/* FOOTER (ALWAYS BOTTOM) */}
      <CardFooter className="flex flex-col gap-2 p-4 pt-0">
        <Button
          onClick={() => {
            handleAddToCart();
            navigate({ to: "/checkout" });
          }}
          className="w-full bg-orange-500 font-semibold text-white hover:bg-orange-600"
        >
          Buy Now!
        </Button>

        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full transition-all duration-200 ease-in-out hover:scale-[1.02]"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock > 0 ? (isAdded ? "Added!" : "Add to Cart") : "Unavailable"}
        </Button>
      </CardFooter>
    </Card>
  );
}
