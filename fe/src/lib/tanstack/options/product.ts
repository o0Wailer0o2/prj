import {
  getInfiniteProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct
} from "@/lib/axios/product";
import type {
  ProductDetailsApiRequest,
  ProductDetailsApiResponse,
  ProductListApiRequest,
  ProductListResponseDTO,
  ProductDTO
} from "@/lib/types/product";
import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions
} from "@tanstack/react-query";

export type ProductsPage = ProductListResponseDTO;

const DEFAULT_LIMIT = 10;

export const createInfiniteProductsQueryOptions = ({
  opts
}: {
  opts?: ProductListApiRequest;
}): UseInfiniteQueryOptions<
  ProductsPage,
  Error,
  InfiniteData<ProductsPage>,
  unknown[],
  number | undefined
> => {
  return {
    queryKey: [
      "products",
      {
        keyword: opts?.keyword,
        types: opts?.types,
        status: opts?.status,
        minPrice: opts?.minPrice,
        maxPrice: opts?.maxPrice,
        minRating: opts?.minRating,
        maxRating: opts?.maxRating,
        inStock: opts?.inStock,
        minStock: opts?.minStock,
        sortBy: opts?.sortBy,
        sortDir: opts?.sortDir,
        fromDate: opts?.fromDate,
        toDate: opts?.toDate
      },
      opts?.paging
    ],

    queryFn: ({ pageParam }) => {
      const paging = pageParam
        ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
        : opts?.paging;

      return getInfiniteProducts({
        ...opts,
        paging
      });
    },

    getNextPageParam: (lastPage) => {
      const limit = opts?.paging?.limit ?? DEFAULT_LIMIT;
      const totalPages = Math.ceil(lastPage.total / limit);
      const nextPage = lastPage.page + 1;

      return nextPage <= totalPages ? nextPage : undefined;
    },

    initialPageParam: opts?.paging?.page ?? 1,
    refetchOnWindowFocus: false
  };
};

export const createProductDetailsQueryOptions = ({
  id
}: ProductDetailsApiRequest): UseQueryOptions<
  ProductDetailsApiResponse["result"],
  Error,
  ProductDetailsApiResponse["result"],
  unknown[]
> => ({
  queryKey: ["product", id],
  queryFn: () => getProductDetails({ id })
});

export const createProductMutationOptions = (): UseMutationOptions<
  ProductDTO,
  Error,
  Partial<ProductDTO>
> => ({
  mutationFn: createProduct
});

export const updateProductMutationOptions = (): UseMutationOptions<
  ProductDTO,
  Error,
  ProductDTO
> => ({
  mutationFn: updateProduct
});

export const deleteProductMutationOptions = (): UseMutationOptions<number, Error, number> => ({
  mutationFn: deleteProduct
});
