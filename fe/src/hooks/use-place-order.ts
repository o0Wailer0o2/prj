import { useMutation } from "@tanstack/react-query";
import {
  createOrderMutationOptions,
  createStripePaymentMutationOptions,
  createCashPaymentMutationOptions
} from "@/lib/tanstack/options/order";
import type { CreateOrderRequest, PaymentMethod } from "@/lib/types/order";
import { useCartStore } from "@/stores/cart-store";
import { useNavigate } from "@tanstack/react-router";

export const usePlaceOrder = () => {
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);

  const createOrderMutation = useMutation(createOrderMutationOptions());
  const createStripePaymentMutation = useMutation(createStripePaymentMutationOptions());
  const createCashPaymentMutation = useMutation(createCashPaymentMutationOptions());

  const placeOrder = async (orderRequest: CreateOrderRequest, paymentMethod: PaymentMethod) => {
    try {
      // Step 1: Create order
      const orderResponse = await createOrderMutation.mutateAsync(orderRequest);

      if (!orderResponse.result.id) {
        throw new Error("Order ID not returned from server");
      }

      const orderId = orderResponse.result.id;
      const amount = orderResponse.result.totalPrice;

      // Step 2: Process payment based on method
      if (paymentMethod === "STRIPE") {
        const stripeResponse = await createStripePaymentMutation.mutateAsync({
          orderId,
          amount,
          returnUrl: window.location.origin
        });

        // Step 3: Redirect to Stripe checkout
        if (stripeResponse.result.sessionUrl) {
          clearCart();
          window.location.href = stripeResponse.result.sessionUrl;
        } else {
          throw new Error("Stripe session URL not provided");
        }
      } else {
        // Cash payment
        await createCashPaymentMutation.mutateAsync({
          orderId,
          amount,
          paymentMethod
        });

        // Step 3: Navigate to success page
        navigate({ to: "/order-success" as any });
        clearCart();
      }
    } catch (error) {
      console.error("Place order error:", error);
      throw error;
    }
  };

  return {
    placeOrder,
    isLoading:
      createOrderMutation.isPending ||
      createStripePaymentMutation.isPending ||
      createCashPaymentMutation.isPending,
    error:
      createOrderMutation.error ||
      createStripePaymentMutation.error ||
      createCashPaymentMutation.error
  };
};
