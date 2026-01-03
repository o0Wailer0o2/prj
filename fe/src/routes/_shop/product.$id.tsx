import ProductDetail from "@/components/product/product-details";
import { createProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/_shop/product/$id")({
  component: RouteComponent
});

function RouteComponent() {
  const { id } = useParams({ from: "/_shop/product/$id" });
  return <ProductDetail />;
}
