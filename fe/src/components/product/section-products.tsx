"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createInfiniteProductsQueryOptions } from "@/lib/tanstack/options/product";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import type { ProductType } from "@/lib/types/product";
import Autoplay from "embla-carousel-autoplay";
import { useSearchStore } from "@/stores/search-store";
import { useRouter } from "@tanstack/react-router";

export function SectionProducts({
  title,
  types,
  direction = "ltr"
}: {
  title: string;
  types: ProductType[];
  direction?: "ltr" | "rtl";
}) {
  const { data: productData } = useInfiniteQuery({
    ...createInfiniteProductsQueryOptions({ opts: { types } })
  });
  const setTypes = useSearchStore((s) => s.setTypes);
  const router = useRouter();

  const products = useMemo(() => {
    if (!productData?.pages) return [];
    return productData.pages.flatMap((page) => page.items ?? []);
  }, [productData]);

  return (
    <section className="relative w-full px-4 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 space-y-3 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[2px] w-10 bg-gradient-to-r from-orange-500 to-transparent"></span>
            <Sparkles className="h-5 w-5 text-orange-500" />
            <span className="h-[2px] w-10 bg-gradient-to-l from-orange-500 to-transparent"></span>
          </div>

          <h2 className="text-foreground text-4xl font-extrabold tracking-tight">{title}</h2>

          <p className="text-muted-foreground mx-auto max-w-xl">
            Explore our premium collection of {title.toLowerCase()}s curated for quality and value.
          </p>

          <Button
            variant="ghost"
            className="text-orange-500 hover:text-orange-600"
            onClick={() => {
              setTypes(types);
              router.navigate({ to: "/search" });
            }}
          >
            View all →
          </Button>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{ align: "center", loop: true, duration: 6000, direction: direction }}
          plugins={[
            Autoplay({
              active: true,
              delay: 0,
              playOnInit: true,
              stopOnInteraction: false,
              // stopOnMouseEnter: true,
              // stopOnFocusIn: true,
              jump: false
            })
          ]}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-full pl-2 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4 xl:basis-1/5"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
