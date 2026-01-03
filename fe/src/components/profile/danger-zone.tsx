import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/instance";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "@tanstack/react-router";

export function DangerZone({ userId }: { userId: number }) {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.clear);
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/user/delete/${userId}`);
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");

      queryClient.setQueryData(["me"], null);

      queryClient.clear();

      logout();

      navigate({ to: "/" });
    },
    onError: () => {
      toast.error("Failed to delete account");
    }
  });

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Be careful — this action is permanent</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-medium">Delete Account</p>
            <p className="text-muted-foreground text-sm">Permanently delete this account</p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              </AlertDialogHeader>

              <p className="text-muted-foreground text-sm">
                This action cannot be undone. This will permanently delete your account.
              </p>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-white"
                  onClick={() => deleteMutation.mutate()}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
