export type PaymentMethod = "CASH" | "STRIPE";

export type OrderStatus = "CANCELLED" | "COMPLETED" | "RETURNED" | "PROCESSING" | "PENDING";

export type OrderSortField =
  | "code"
  | "userFullName"
  | "userEmail"
  | "totalPrice"
  | "status"
  | "createdAt";

export interface OrderItemDTO {
  id?: number;
  productId: number;
  productTitle?: string;
  quantity: number;
  price?: number;
  subtotal?: number;
}

export interface OrderDTO {
  id: number;
  code: string;
  userId: number;
  userFullName: string;
  userEmail: string;
  userPhoneNumber: string;
  shippingStreet: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingCountry: string;
  shippingZip: string;
  shippingNumber?: string;
  tax: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number;
  status: OrderStatus;
  orderNotes?: string;
  orderItemIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  order: {
    userFullName: string;
    userEmail: string;
    userPhoneNumber: string;
    shippingStreet: string;
    shippingCity: string;
    shippingDistrict: string;
    shippingCountry: string;
    shippingZip: string;
    shippingNumber?: string;
    orderNotes?: string;
    tax: number;
    deliveryFee: number;
    discount: number;
    totalPrice: number;
  };
  orderItems: OrderItemDTO[];
  paymentMethod: PaymentMethod;
}

export interface OrderFilterRequest {
  status?: OrderStatus[];
  keyword?: string;
  sortBy?: OrderSortField;
  sortDir?: "asc" | "desc";
  userId?: number;
}

export interface OrderItemDTO {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  order: {
    userFullName: string;
    userEmail: string;
    userPhoneNumber: string;
    shippingStreet: string;
    shippingCity: string;
    shippingDistrict: string;
    shippingCountry: string;
    shippingZip: string;
    shippingNumber?: string;
    orderNotes?: string;
    tax: number;
    deliveryFee: number;
    discount: number;
    totalPrice: number;
  };
  orderItems: OrderItemDTO[];
  paymentMethod: PaymentMethod;
}

export interface CreateOrderResponse {
  code: number;
  message: string;
  result: {
    id?: number;
    code?: string;
    userFullName: string;
    userEmail: string;
    totalPrice: number;
    status?: string;
  };
}

export interface PaymentRequest {
  orderId: number;
  amount: number;
}

export interface PaymentResponse {
  code: number;
  message: string;
  success: boolean;
  paymentUrl?: string;
}

export interface StripeCreatePaymentRequest {
  orderId: number;
  amount: number;
  returnUrl: string;
}

export interface StripeResponse {
  sessionId: string;
  sessionUrl: string;
}

export interface StripeApiResponse {
  code: number;
  message: string;
  result: StripeResponse;
}

export interface CashPaymentRequest {
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface CashPaymentResponse {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
}

export interface CashApiResponse {
  code: number;
  message: string;
  result: CashPaymentResponse;
}
