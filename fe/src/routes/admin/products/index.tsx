"use client";

import { useState, useMemo } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInfiniteProductsQueryOptions,
  deleteProductMutationOptions
} from "@/lib/tanstack/options/product";
import type { ProductDTO, ProductSortField } from "@/lib/types/product";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
// import { statusMap } from "@/lib/status-map";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { ProductFormDialog } from "@/components/admin/product/product-form-dialog";
import { DataTableColumnHeader } from "@/components/admin/table/column-header";
import { DataTable } from "@/components/admin/table/data-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsPage
});

export const statusMap: Record<
  number,
  { label: string; variant: "default" | "destructive" | "outline" | "secondary" }
> = {
  0: { label: "Inactive", variant: "destructive" },
  1: { label: "Active", variant: "secondary" }
};

const ActionsCell = ({ product }: { product: ProductDTO }) => {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteProductMutationOptions(),
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    }
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(String(product.id));
              toast.success("Copied ID!");
            }}
          >
            Copy ID
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>Edit</DropdownMenuItem>

          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteDialogOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={product}
        mode="edit"
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{product.title}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteMutation.mutate(product.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const columns: ColumnDef<ProductDTO>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    enableSorting: true
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    enableSorting: false
  },
  {
    accessorKey: "currentPrice",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    enableSorting: true
  },
  {
    accessorKey: "originalValue",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Original Price" />,
    enableSorting: true
  },
  {
    accessorKey: "averageRating",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    enableSorting: true
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    enableSorting: true
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const info = statusMap[status] ?? { label: "Unknown", variant: "secondary" };
      return <Badge variant={info.variant}>{info.label}</Badge>;
    },
    enableSorting: false
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell product={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
];

export default function ProductsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const keyword = (columnFilters.find((f) => f.id === "title")?.value as string) ?? "";
  const [debouncedKeyword] = useDebounceValue(keyword, 300);

  const sortFieldMap: Record<string, ProductSortField> = {
    title: "title",
    currentPrice: "currentPrice",
    originalValue: "originalValue",
    averageRating: "averageRating",
    stock: "stock"
  };

  const sort = sorting[0];
  const sortBy = sort ? sortFieldMap[sort.id] : undefined;
  const sortDir = sort?.desc ? "desc" : "asc";

  const query = useInfiniteQuery({
    ...createInfiniteProductsQueryOptions({
      opts: {
        keyword: debouncedKeyword || undefined,
        types: ["BOOK", "CD", "DVD", "NEWSPAPER"],
        sortBy: sortBy,
        sortDir,
        paging: {
          page: pagination.pageIndex,
          limit: pagination.pageSize
        }
      }
    })
  });

  const total = query.data?.pages[0].total ?? 0;

  const products = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((p) => p.items ?? []);
  }, [query.data]);

  const table = useReactTable({
    data: products,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { pagination, sorting, columnFilters },
    pageCount: Math.ceil(total / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting
  });

  return (
    <div className="container mx-auto flex flex-col gap-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <DataTable table={table} filterKey="title" />

      <ProductFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} mode="create" />
    </div>
  );
}
