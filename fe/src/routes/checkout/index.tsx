"use client";

import type React from "react";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createCartProductsQueryOptions } from "@/lib/tanstack/options/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PaymentMethod, CreateOrderRequest, OrderItemDTO } from "@/lib/types/order";
import { ShoppingBag, CreditCard, Banknote, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCartStore } from "@/stores/cart-store";
import { useState } from "react";
import { calculateCartTotal } from "@/utils/cart/cart-calculation";
import { usePlaceOrder } from "@/hooks/use-place-order";

export const Route = createFileRoute("/checkout/")({ component: CheckoutPage });

function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const productIds = useMemo(() => items.map((item) => item.productId), [items]);

  const { data: products, isLoading } = useQuery(
    createCartProductsQueryOptions({ ids: productIds })
  );

  const [formData, setFormData] = useState({
    userFullName: "",
    userEmail: "",
    userPhoneNumber: "",
    shippingStreet: "",
    shippingCity: "",
    shippingDistrict: "",
    shippingCountry: "",
    shippingZip: "",
    shippingNumber: "",
    orderNotes: ""
  });

  const { placeOrder, isLoading: isProcessing, error } = usePlaceOrder();

  const totals = calculateCartTotal(products, items);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!products || products.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      const orderItems: OrderItemDTO[] = products.map((product) => {
        const cartItem = items.find((item) => item.productId === product.id);
        return {
          productId: product.id,
          quantity: cartItem?.quantity || 1
        };
      });

      const orderRequest: CreateOrderRequest = {
        order: {
          ...formData,
          tax: totals.tax,
          deliveryFee: totals.deliveryFee,
          discount: 0,
          totalPrice: totals.total
        },
        orderItems,
        paymentMethod
      };

      await placeOrder(orderRequest, paymentMethod);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to process order. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
        <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some products to checkout</p>
        <Button onClick={() => navigate({ to: "/" })}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Shipping Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="userFullName">Full Name *</Label>
                  <Input
                    id="userFullName"
                    required
                    value={formData.userFullName}
                    onChange={(e) => setFormData({ ...formData, userFullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    required
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="userPhoneNumber">Phone Number *</Label>
                  <Input
                    id="userPhoneNumber"
                    type="tel"
                    required
                    value={formData.userPhoneNumber}
                    onChange={(e) => setFormData({ ...formData, userPhoneNumber: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="shippingStreet">Street Address *</Label>
                  <Input
                    id="shippingStreet"
                    required
                    value={formData.shippingStreet}
                    onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="shippingCity">City *</Label>
                  <Input
                    id="shippingCity"
                    required
                    value={formData.shippingCity}
                    onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="shippingDistrict">District *</Label>
                  <Input
                    id="shippingDistrict"
                    required
                    value={formData.shippingDistrict}
                    onChange={(e) => setFormData({ ...formData, shippingDistrict: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="shippingCountry">Country *</Label>
                  <Input
                    id="shippingCountry"
                    required
                    value={formData.shippingCountry}
                    onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="shippingZip">Zip Code *</Label>
                  <Input
                    id="shippingZip"
                    required
                    value={formData.shippingZip}
                    onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="shippingNumber">Additional Address Info</Label>
                  <Input
                    id="shippingNumber"
                    placeholder="Apartment, suite, etc."
                    value={formData.shippingNumber}
                    onChange={(e) => setFormData({ ...formData, shippingNumber: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
                  <Textarea
                    id="orderNotes"
                    placeholder="Special instructions for delivery"
                    value={formData.orderNotes}
                    onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <div className="flex items-center space-x-3 rounded-lg border p-4">
                  <RadioGroupItem value="CASH" id="cash" />
                  <Label htmlFor="cash" className="flex flex-1 cursor-pointer items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-muted-foreground text-sm">Pay when you receive</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-4">
                  <RadioGroupItem value="STRIPE" id="stripe" />
                  <Label htmlFor="stripe" className="flex flex-1 cursor-pointer items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Stripe Payment</p>
                      <p className="text-muted-foreground text-sm">Pay securely with card</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-6">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

              <div className="space-y-4">
                {products.map((product) => {
                  const cartItem = items.find((item) => item.productId === product.id);
                  const quantity = cartItem?.quantity || 0;

                  return (
                    <div key={product.id} className="flex gap-3">
                      <div
                        className="h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-white transition-opacity hover:opacity-80"
                        onClick={() => navigate({ to: `/product/${product.id}` })}
                      >
                        <img
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => navigate({ to: `/product/${product.id}` })}
                          >
                            <p className="hover:text-primary line-clamp-2 text-sm font-medium transition-colors">
                              {product.title}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => removeFromCart(product.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="bg-background flex items-center rounded-md border">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md"
                              onClick={() => decrementQuantity(product.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs">{quantity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md"
                              onClick={() => incrementQuantity(product.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-semibold">
                            ${(product.currentPrice * quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>${totals.deliveryFee.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <Button type="submit" className="mt-6 w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
