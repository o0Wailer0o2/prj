import { useRef } from "react";
import axiosInstance from "@/lib/axios/instance";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Mail, Calendar } from "lucide-react";
import type { UserDTO } from "@/lib/types/user";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfileHeader({ user }: { user: UserDTO }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleClick = () => inputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload file
      const res = await axiosInstance.post("/file/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const url: string = res.data.result;

      // 2. Update user avatar
      await axiosInstance.post("/user/info", { ...user, avatarUrl: url });

      queryClient.setQueryData(["me"], (old: UserDTO | undefined) => {
        if (!old) return old;
        return { ...old, avatarUrl: url };
      });

      toast.success("Avatar updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update avatar");
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUrl ?? ""} alt={user.fullName} />
              <AvatarFallback className="text-2xl">
                {user.fullName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Button
              onClick={handleClick}
              size="icon"
              variant="outline"
              className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
            >
              <Camera />
            </Button>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={inputRef}
              onChange={handleChange}
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <Badge variant="secondary">{user.roleName}</Badge>
            </div>

            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {user.email}
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                {user.birthday ? user.birthday : "No birthday set"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
