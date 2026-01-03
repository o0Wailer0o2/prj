import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filter";
import { createInfiniteProductsQueryOptions } from "@/lib/tanstack/options/product";
import type { ProductSortField, ProductType, SortDirection } from "@/lib/types/product";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useSearchStore } from "@/stores/search-store";

export const Route = createFileRoute("/_shop/search")({
  component: Index
});

function Index() {
  const { keyword, setKeyword } = useSearchStore();
  const [debounce] = useDebounceValue(keyword, 500);
  const { types, setTypes } = useSearchStore();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // → minPrice, maxPrice
  const [ratingFilter, setRatingFilter] = useState<number>(0); // → minRating
  const [inStockOnly, setInStockOnly] = useState<boolean>(false); // → inStock
  const [sortBy, setSortBy] = useState<ProductSortField>("createdAt"); // → sortBy
  const [sortDir, setSortDir] = useState<SortDirection>("desc"); // → sortDir

  const [minPrice] = useDebounceValue(priceRange[0], 500);
  const [maxPrice] = useDebounceValue(priceRange[1], 500);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    ...createInfiniteProductsQueryOptions({
      opts: {
        keyword: debounce, // string
        types, // ProductType[]
        minPrice, // number
        maxPrice, // number
        minRating: ratingFilter, // number
        maxRating: 5, // optional cap
        inStock: inStockOnly, // boolean
        minStock: inStockOnly ? 1 : undefined,
        sortBy, // field name: price, rating, createdAt, etc.
        sortDir, // ASC | DESC
        fromDate: undefined, // you can add UI later
        toDate: undefined,
        paging: {
          page: 1,
          limit: 12
        }
      }
    })
  });

  useEffect(() => {
    refetch();
  }, [keyword, types, priceRange, ratingFilter, inStockOnly, sortBy, sortDir, refetch]);

  // Flatten pages
  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.items ?? []);
  }, [data]);

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* 🔥 Filters */}
          <ProductFilters
            keyword={keyword}
            onKeywordChange={setKeyword}
            types={types}
            onTypesChange={setTypes}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            ratingFilter={ratingFilter}
            onRatingChange={setRatingFilter}
            inStockOnly={inStockOnly}
            onInStockChange={setInStockOnly}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortDir={sortDir}
            onSortDirChange={setSortDir}
          />

          {/* 🔥 Product Grid */}
          <div className="lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.length > 0 ? (
                products.map((p) => <ProductCard key={p.id} product={p} />)
              ) : (
                <div className="text-muted-foreground col-span-full py-12 text-center">
                  No matching products
                </div>
              )}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
