import type { PagingDTO } from "@/lib/types/paging";

export type ProductType = "CD" | "DVD" | "NEWSPAPER" | "BOOK";
export type ProductSortField =
  | "title"
  | "currentPrice"
  | "originalValue"
  | "averageRating"
  | "stock"
  | "createdAt";
export type SortDirection = "asc" | "desc";

export interface ProductDTO {
  id: number;
  imageUrl: string;
  averageRating: number;
  barcode: string;
  title: string;
  description: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  originalValue: number;
  currentPrice: number;
  stock: number;
  status: number;
  type: ProductType;
}

export interface BookDetails {
  productId: number;
  authors: string;
  coverType: string;
  publisher: string;
  publicationDate: string;
  pages: number;
  language: string;
  genre: string;
}

export interface CDDetails {
  productId: number;
  artists: string;
  recordLabel: string;
  genre: string;
  releaseDate: string;
  lengthSeconds: number;
}

export interface DVDDetails {
  productId: number;
  discType: string;
  director: string;
  runtimeMinutes: number;
  studio: string;
  language: string;
  subtitles: string;
  releaseDate: string;
  genre: string;
}

export interface NewspaperDetails {
  productId: number;
  editorInChief: string;
  publisher: string;
  publicationDate: string;
  issueNumber: number;
  frequency: string;
  issn: string;
  language: string;
  sections: string;
}

export interface ProductListApiRequest {
  keyword?: string;

  types?: ProductType[];

  status?: number;

  minPrice?: number;
  maxPrice?: number;

  minRating?: number;
  maxRating?: number;

  inStock?: boolean;
  minStock?: number;

  sortBy?: ProductSortField;
  sortDir?: SortDirection;

  fromDate?: string;
  toDate?: string;

  paging?: PagingDTO;
}

export interface ProductListResponseDTO {
  total: number;
  page: number;
  items: ProductDTO[];
}

export interface ProductListApiResponse {
  code: number;
  message: string;
  result: ProductListResponseDTO;
}

export interface ProductDetailsApiRequest {
  id: string | number;
}

export interface ProductDetailsResponseDTO {
  product: ProductDTO;
  book?: BookDetails;
  dvd?: DVDDetails;
  cd?: CDDetails;
  newspaper?: NewspaperDetails;
}

export interface ProductDetailsApiResponse {
  code: number;
  message: string;
  result: ProductDetailsResponseDTO;
}
