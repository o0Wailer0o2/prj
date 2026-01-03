import axiosInstance from "@/lib/axios/instance";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  StripeCreatePaymentRequest,
  StripeApiResponse,
  CashPaymentRequest,
  CashApiResponse,
  OrderDTO,
  OrderFilterRequest
} from "@/lib/types/order";
import type { QueryKey } from "@tanstack/react-query";

export const createOrder = async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
  const response = await axiosInstance.post<CreateOrderResponse>("/order/create", request);
  return response.data;
};

export const createStripePayment = async (
  request: StripeCreatePaymentRequest
): Promise<StripeApiResponse> => {
  const response = await axiosInstance.post<StripeApiResponse>("/stripe/create-payment", request);
  return response.data;
};

export const createCashPayment = async (request: CashPaymentRequest): Promise<CashApiResponse> => {
  const response = await axiosInstance.post<CashApiResponse>("/payment/create", request);
  return response.data;
};

export interface PageData {
  items: OrderDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetInfiniteOrdersProps {
  opts?: OrderFilterRequest & {
    paging?: {
      page: number;
      limit: number;
    };
  };
}

export const getInfiniteOrders = async ({
  pageParam = 1,
  opts
}: {
  pageParam: number;
  opts?: GetInfiniteOrdersProps["opts"];
}): Promise<PageData> => {
  const response = await axiosInstance.get<{
    code: number;
    message: string;
    result: {
      items: OrderDTO[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>("/order/list", {
    params: {
      status: opts?.status?.join(","),
      keyword: opts?.keyword,
      sortBy: opts?.sortBy,
      sortDir: opts?.sortDir,
      page: pageParam,
      limit: opts?.paging?.limit || 20,
      userId: opts?.userId
    }
  });

  return response.data.result;
};

export const getInfiniteOrdersQueryKey = (props?: GetInfiniteOrdersProps): QueryKey => {
  return ["orders", props?.opts ?? {}];
};

export const updateOrder = async (order: OrderDTO) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: OrderDTO;
  }>("/order/update", order);
  return response.data.result;
};

export const deleteOrder = async (id: number) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: number;
  }>("/order/delete", null, {
    params: { id }
  });
  return response.data.result;
};

export const getOrderById = async (id: number) => {
  const response = await axiosInstance.get<{
    code: number;
    message: string;
    result: OrderDTO;
  }>("/order/get", {
    params: { id }
  });
  return response.data.result;
};

export const batchDeleteOrders = async (ids: number[]) => {
  const deletePromises = ids.map((id) => deleteOrder(id));
  await Promise.all(deletePromises);
  return ids.length;
};
