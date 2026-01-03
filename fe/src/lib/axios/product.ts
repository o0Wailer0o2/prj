import axiosInstance from "@/lib/axios/instance";
import type {
  ProductDetailsApiRequest,
  ProductDetailsApiResponse,
  ProductListApiRequest,
  ProductListApiResponse,
  ProductDTO
} from "@/lib/types/product";

export const getInfiniteProducts = async (filters: ProductListApiRequest) => {
  const response = await axiosInstance.get<ProductListApiResponse>("/product/list", {
    params: {
      keyword: filters.keyword,
      types: filters.types,
      status: filters.status,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      maxRating: filters.maxRating,
      inStock: filters.inStock,
      minStock: filters.minStock,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.paging?.page,
      limit: filters.paging?.limit
    }
  });

  return response.data.result;
};

export const getProductDetails = async ({ id }: ProductDetailsApiRequest) => {
  const response = await axiosInstance.get<ProductDetailsApiResponse>("/product/detail", {
    params: { id }
  });

  return response.data.result;
};

export const createProduct = async (product: Partial<ProductDTO>) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: ProductDTO;
  }>("/product/create", product);

  return response.data.result;
};

export const updateProduct = async (product: ProductDTO) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: ProductDTO;
  }>("/product/update", product);

  return response.data.result;
};

export const deleteProduct = async (id: number) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: number;
  }>("/product/delete", null, {
    params: { id }
  });

  return response.data.result;
};
