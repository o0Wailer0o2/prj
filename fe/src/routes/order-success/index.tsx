"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package, Home, ShoppingBag } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/order-success/")({ component: OrderSuccessPage });

function OrderSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto min-h-screen px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="bg-primary/10 flex h-24 w-24 items-center justify-center rounded-full">
            <CheckCircle2 className="text-primary h-12 w-12" />
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">Order Placed Successfully!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6 p-6">
          <div className="mb-6 flex items-center gap-3 border-b pb-4">
            <Package className="text-primary h-6 w-6" />
            <h2 className="text-xl font-semibold">What's Next?</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                <span className="text-primary font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold">Order Confirmation</h3>
                <p className="text-muted-foreground text-sm">
                  You will receive an email confirmation with your order details shortly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                <span className="text-primary font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold">Processing</h3>
                <p className="text-muted-foreground text-sm">
                  Our team is preparing your order for shipment. This usually takes 1-2 business
                  days.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                <span className="text-primary font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold">Delivery</h3>
                <p className="text-muted-foreground text-sm">
                  Once shipped, you'll receive tracking information to monitor your delivery.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={() => navigate({ to: "/" })}>
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => navigate({ to: "/" })}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Continue Shopping
          </Button>
        </div>

        {/* Help Section */}
        <div className="bg-muted mt-8 rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Need help with your order? Contact our support team at{" "}
            <a href="mailto:support@mediabox.com" className="text-primary hover:underline">
              support@mediabox.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
