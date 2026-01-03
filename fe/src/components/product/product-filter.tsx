"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Star, X } from "lucide-react";
import type { ProductSortField, ProductType, SortDirection } from "@/lib/types/product";

interface ProductFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  types: ProductType[];
  onTypesChange: (value: ProductType[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  ratingFilter: number;
  onRatingChange: (rating: number) => void;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
  sortBy: ProductSortField;
  onSortChange: (value: ProductSortField) => void;
  sortDir: SortDirection;
  onSortDirChange: (value: SortDirection) => void;
}

interface SortOption {
  id: string;
  label: string;
  field: ProductSortField;
  direction: SortDirection;
}

const sortOptions: SortOption[] = [
  { id: "price-low", label: "Price: Low to High", field: "currentPrice", direction: "asc" },
  { id: "price-high", label: "Price: High to Low", field: "currentPrice", direction: "desc" },
  { id: "rating-high", label: "Highest Rated", field: "averageRating", direction: "desc" },
  { id: "newest", label: "Newest", field: "createdAt", direction: "desc" }
];

export function ProductFilters(props: ProductFiltersProps) {
  const {
    keyword,
    onKeywordChange,
    types,
    onTypesChange,
    priceRange,
    onPriceChange,
    ratingFilter,
    onRatingChange,
    inStockOnly,
    onInStockChange,
    sortBy,
    onSortChange,
    sortDir,
    onSortDirChange
  } = props;

  const toggleProductType = (type: ProductType) => {
    if (types.includes(type)) {
      onTypesChange(types.filter((t) => t !== type));
    } else {
      onTypesChange([...types, type]);
    }
  };

  const hasActiveFilters =
    keyword.length > 0 ||
    types.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000 ||
    ratingFilter > 0 ||
    inStockOnly;

  return (
    <div className="space-y-6 lg:col-span-1">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Search products..."
          />
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["BOOK", "CD", "DVD", "NEWSPAPER"] as ProductType[]).map((type) => (
            <div className="flex items-center space-x-2" key={type}>
              <Checkbox
                checked={types.includes(type)}
                onCheckedChange={() => toggleProductType(type)}
              />
              <Label className="cursor-pointer">{type}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            min={0}
            max={1000}
            step={1}
            value={priceRange}
            onValueChange={(val) => onPriceChange([val[0], val[1]] as [number, number])}
          />
          <p className="text-muted-foreground mt-2 text-xs">
            ${priceRange[0]} – ${priceRange[1]}
          </p>
        </CardContent>
      </Card>

      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={`${sortBy}-${sortDir}`}
            onValueChange={(v) => {
              const option = sortOptions.find((o) => `${o.field}-${o.direction}` === v);
              if (!option) return;
              onSortChange(option.field);
              onSortDirChange(option.direction);
            }}
            className="space-y-3"
          >
            {sortOptions.map((option) => (
              <div className="flex items-center space-x-2" key={option.id}>
                <RadioGroupItem value={`${option.field}-${option.direction}`} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <RadioGroup
            value={String(ratingFilter)}
            onValueChange={(v) => onRatingChange(Number(v))}
            className="space-y-3"
          >
            {[5, 4, 3, 2, 1, 0].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={String(rating)} id={`rating-${rating}`} />
                <Label
                  htmlFor={`rating-${rating}`}
                  className="flex cursor-pointer items-center gap-1"
                >
                  {rating === 0 ? (
                    "All products"
                  ) : (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      & Up
                    </>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox checked={inStockOnly} onCheckedChange={(v) => onInStockChange(Boolean(v))} />
            <Label className="cursor-pointer">In-stock only</Label>
          </div>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            onKeywordChange("");
            onTypesChange(["BOOK", "CD", "DVD", "NEWSPAPER"]);
            onPriceChange([0, 1000]);
            onRatingChange(0);
            onInStockChange(false);
            onSortChange("createdAt");
            onSortDirChange("desc");
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
