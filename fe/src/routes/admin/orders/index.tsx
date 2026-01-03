"use client";

import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/admin/table/data-table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState
} from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/admin/table/column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import type { OrderDTO, OrderSortField, OrderStatus } from "@/lib/types/order";
import { createInfiniteOrdersQueryOptions } from "@/lib/tanstack/options/order";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { OrderFormDialog } from "@/components/admin/order/order-form-dialog";
import { deleteOrder, batchDeleteOrders } from "@/lib/axios/order";
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
import { StatusFilter } from "@/components/admin/order/status-filter";

export const Route = createFileRoute("/admin/orders/")({
  component: Index
});

/* -------------------------------- Status Map -------------------------------- */

const statusMap: Record<
  OrderStatus,
  { label: string; variant: "default" | "destructive" | "outline" | "secondary" }
> = {
  PENDING: { label: "Pending", variant: "outline" },
  PROCESSING: { label: "Processing", variant: "default" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  RETURNED: { label: "Returned", variant: "destructive" }
};

function Index() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingOrderId, setViewingOrderId] = useState<number | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([
    "COMPLETED",
    "PENDING",
    "PROCESSING",
    "RETURNED",
    "CANCELLED"
  ]);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success("Order deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDeleteDialogOpen(false);
      setDeletingOrderId(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete order: ${error.message}`);
    }
  });

  const batchDeleteMutation = useMutation({
    mutationFn: batchDeleteOrders,
    onSuccess: (count) => {
      toast.success(`Successfully deleted ${count} order(s)!`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setBatchDeleteDialogOpen(false);
      setRowSelection({});
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete orders: ${error.message}`);
    }
  });

  const handleDelete = (orderId: number) => {
    setDeletingOrderId(orderId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingOrderId) {
      deleteMutation.mutate(deletingOrderId);
    }
  };

  const handleBatchDelete = () => {
    setBatchDeleteDialogOpen(true);
  };

  const confirmBatchDelete = () => {
    const selectedIds = Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => orders[Number.parseInt(key)].id);

    if (selectedIds.length > 0) {
      batchDeleteMutation.mutate(selectedIds);
    }
  };

  const handleView = (orderId: number) => {
    setViewingOrderId(orderId);
    setIsFormOpen(true);
  };

  const columns: ColumnDef<OrderDTO>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
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
        accessorKey: "code",
        header: ({ column }) => <DataTableColumnHeader title="Order Code" column={column} />,
        enableSorting: true
      },
      {
        accessorKey: "userFullName",
        header: ({ column }) => <DataTableColumnHeader title="Customer Name" column={column} />,
        enableSorting: true
      },
      {
        accessorKey: "userEmail",
        header: ({ column }) => <DataTableColumnHeader title="Email" column={column} />,
        enableSorting: true
      },
      {
        accessorKey: "totalPrice",
        header: ({ column }) => <DataTableColumnHeader title="Total Price" column={column} />,
        cell: ({ row }) => {
          const amount = Number.parseFloat(row.getValue("totalPrice"));
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
          }).format(amount);
          return <div className="font-medium">{formatted}</div>;
        },
        enableSorting: true
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader title="Status" column={column} />,
        cell: ({ row }) => {
          const status = row.original.status;
          const info = statusMap[status];
          return <Badge variant={info.variant}>{info.label}</Badge>;
        },
        enableSorting: true
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader title="Created At" column={column} />,
        cell: ({ row }) => {
          const date = row.original.createdAt;
          if (!date) return "-";
          return new Date(date).toLocaleDateString();
        },
        enableSorting: true
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const order = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(order.code);
                    toast.success("Copied order code!");
                  }}
                >
                  Copy Code
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleView(order.id)}>View/Edit</DropdownMenuItem>

                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(order.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  );

  const keyword = (columnFilters.find((f) => f.id === "code")?.value as string) ?? "";
  const [debouncedKeyword] = useDebounceValue(keyword, 300);

  const sortMap: Record<string, OrderSortField> = {
    code: "code",
    userFullName: "userFullName",
    userEmail: "userEmail",
    totalPrice: "totalPrice",
    status: "status",
    createdAt: "createdAt"
  };

  const sort = sorting[0];
  const sortBy = sort ? sortMap[sort.id] : undefined;
  const sortDir = sort?.desc ? "desc" : "asc";

  const query = useInfiniteQuery({
    ...createInfiniteOrdersQueryOptions({
      opts: {
        keyword: debouncedKeyword || undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        sortBy,
        sortDir,
        paging: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize
        }
      }
    })
  });

  const total = query.data?.pages[0]?.total ?? 0;

  const orders = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((o) => o.items ?? []);
  }, [query.data]);

  const table = useReactTable({
    data: orders,
    columns: columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { pagination, sorting, columnFilters, rowSelection },
    pageCount: Math.ceil(total / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true
  });

  const selectedRowCount = Object.keys(rowSelection).filter((key) => rowSelection[key]).length;

  return (
    <div className="container mx-auto flex flex-col gap-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusFilter selectedStatuses={selectedStatuses} onStatusChange={setSelectedStatuses} />

        {selectedRowCount > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBatchDelete} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete {selectedRowCount} order(s)
          </Button>
        )}
      </div>

      <DataTable table={table} filterKey="code" />

      <OrderFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} orderId={viewingOrderId} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedRowCount} order(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBatchDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={batchDeleteMutation.isPending}
            >
              {batchDeleteMutation.isPending ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
