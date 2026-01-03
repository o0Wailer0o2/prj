"use client";

import { useMemo } from "react";
import { Search, TrendingUp } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createInfiniteProductsQueryOptions } from "@/lib/tanstack/options/product";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { Link } from "@tanstack/react-router";

interface SearchSuggestionsProps {
  query: string;

  isVisible: boolean;
  onClose: () => void;
  onSelectSuggestion: (suggestion: string) => void;
  isMobile?: boolean;
}

export default function SearchSuggestions({
  query,
  isVisible,
  onClose,
  onSelectSuggestion,
  isMobile = false
}: SearchSuggestionsProps) {
  const { data } = useInfiniteQuery({
    ...createInfiniteProductsQueryOptions({
      opts: {
        keyword: query,
        paging: { page: 1, limit: 12 }
      }
    })
  });

  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.items ?? []);
  }, [data]);

  if (!isVisible || query.trim().length === 0) return null;

  return (
    <Popover open={isVisible}>
      <PopoverContent className="mt-1 w-full max-w-xs rounded-lg border border-gray-200 bg-white p-0 shadow-lg">
        <div className="p-4">
          {products.length > 0 ? (
            <>
              <div className="mb-3 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Sản phẩm đề xuất</span>
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/$id`}
                    params={{ id: String(product.id) }}
                    onClick={() => {
                      onSelectSuggestion(product.title);
                      onClose();
                    }}
                    className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                  >
                    <ImageWithFallback
                      src={product.imageUrl ?? "/placeholder.svg"}
                      alt={product.title}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-gray-900">{product.title}</div>
                      <div className="text-xs font-semibold text-red-600">{product.price}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-8 text-gray-500">
              <Search className="mb-3 h-12 w-12 text-gray-300" />
              Không tìm thấy gợi ý nào
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
