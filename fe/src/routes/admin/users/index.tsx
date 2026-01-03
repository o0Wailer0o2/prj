"use client";

import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/admin/table/data-table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/admin/table/column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import type { UserDTO, UserSortField } from "@/lib/types/user";
import { createInfiniteUsersQueryOptions } from "@/lib/tanstack/options/user";
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
import { deleteUser } from "@/lib/axios/user";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserFormDialog } from "@/components/admin/user/user-form-dialog";

export const Route = createFileRoute("/admin/users/")({
  component: Index
});

/* -------------------------------- Columns -------------------------------- */

const statusMap: Record<
  number,
  { label: string; variant: "default" | "destructive" | "outline" | "secondary" }
> = {
  0: { label: "Inactive", variant: "destructive" },
  1: { label: "Active", variant: "secondary" }
};

function Index() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteDialogOpen(false);
      setDeletingUserId(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    }
  });

  const handleDelete = (userId: number) => {
    setDeletingUserId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingUserId) {
      deleteMutation.mutate(deletingUserId);
    }
  };

  const handleEdit = (userId: number) => {
    setEditingUserId(userId);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingUserId(undefined);
    setIsFormOpen(true);
  };

  const columns: ColumnDef<UserDTO>[] = useMemo(
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
        accessorKey: "avatarUrl",
        header: "Avatar",
        cell: ({ row }) => (
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.avatarUrl || undefined} alt={row.original.fullName} />
            <AvatarFallback>
              {row.original.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ),
        enableSorting: false
      },
      {
        accessorKey: "fullName",
        header: ({ column }) => <DataTableColumnHeader title="Full Name" column={column} />,
        enableSorting: true
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader title="Email" column={column} />,
        enableSorting: true
      },
      {
        accessorKey: "roleName",
        header: ({ column }) => <DataTableColumnHeader title="Role" column={column} />,
        enableSorting: true
      },
      {
        accessorKey: "active",
        header: ({ column }) => <DataTableColumnHeader title="Status" column={column} />,
        cell: ({ row }) => {
          const info = statusMap[row.original.active];
          return <Badge variant={info.variant}>{info.label}</Badge>;
        },
        enableSorting: false
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;

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
                    navigator.clipboard.writeText(String(user.id));
                    toast.success("Copied ID!");
                  }}
                >
                  Copy ID
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleEdit(user.id)}>Edit</DropdownMenuItem>

                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
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

  const keyword = (columnFilters.find((f) => f.id === "fullName")?.value as string) ?? "";
  const [debouncedKeyword] = useDebounceValue(keyword, 300);

  const sortMap: Record<string, UserSortField> = {
    fullName: "fullname",
    email: "email",
    roleName: "role",
    active: "active"
  };

  const sort = sorting[0];
  const sortBy = sort ? sortMap[sort.id] : undefined;
  const sortDir = sort?.desc ? "desc" : "asc";

  const query = useInfiniteQuery({
    ...createInfiniteUsersQueryOptions({
      opts: {
        keyword: debouncedKeyword || undefined,
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

  const users = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((u) => u.items ?? []);
  }, [query.data]);

  const table = useReactTable({
    data: users,
    columns: columns,
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
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataTable table={table} filterKey="fullName" />

      <UserFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} userId={editingUserId} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
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
    </div>
  );
}
