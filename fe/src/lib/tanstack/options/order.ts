import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions
} from "@tanstack/react-query";
import {
  createOrder,
  createStripePayment,
  createCashPayment,
  type GetInfiniteOrdersProps,
  type PageData,
  getInfiniteOrders,
  updateOrder
} from "@/lib/axios/order";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  StripeCreatePaymentRequest,
  StripeApiResponse,
  CashPaymentRequest,
  CashApiResponse,
  OrderDTO
} from "@/lib/types/order";

export type OrdersPage = PageData;

const DEFAULT_LIMIT = 10;

export const createOrderMutationOptions = (): UseMutationOptions<
  CreateOrderResponse,
  Error,
  CreateOrderRequest
> => {
  return {
    mutationFn: createOrder
  };
};

export const createStripePaymentMutationOptions = (): UseMutationOptions<
  StripeApiResponse,
  Error,
  StripeCreatePaymentRequest
> => {
  return {
    mutationFn: createStripePayment
  };
};

export const createCashPaymentMutationOptions = (): UseMutationOptions<
  CashApiResponse,
  Error,
  CashPaymentRequest
> => {
  return {
    mutationFn: createCashPayment
  };
};

export const createInfiniteOrdersQueryOptions = ({
  opts
}: {
  opts?: GetInfiniteOrdersProps["opts"];
}): UseInfiniteQueryOptions<
  OrdersPage,
  Error,
  InfiniteData<OrdersPage>,
  unknown[],
  number | undefined
> => {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "orders",
      {
        keyword: opts?.keyword,
        status: opts?.status,
        sortBy: opts?.sortBy,
        sortDir: opts?.sortDir,
        userId: opts?.userId
      },
      opts?.paging
    ],

    queryFn: ({ pageParam }) => {
      const paging = pageParam
        ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
        : opts?.paging;

      return getInfiniteOrders({
        pageParam: paging?.page ?? 1,
        opts: {
          ...opts,
          paging
        }
      });
    },

    getNextPageParam: (lastPage) => {
      const limit = opts?.paging?.limit ?? DEFAULT_LIMIT;
      const totalPages = Math.ceil(lastPage.total / limit);
      const nextPage = lastPage.page + 1;

      return nextPage <= totalPages ? nextPage : undefined;
    },

    getPreviousPageParam: (firstPage) => {
      if (firstPage.page > 1) {
        return firstPage.page - 1;
      }
      return undefined;
    },

    initialPageParam: opts?.paging?.page ?? 1,
    refetchOnWindowFocus: false
  };
};

export const updateOrderMutationOptions = (): UseMutationOptions<OrderDTO, Error, OrderDTO> => {
  return {
    mutationFn: updateOrder
  };
};
