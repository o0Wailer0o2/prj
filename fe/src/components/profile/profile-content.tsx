import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { UserDTO } from "@/lib/types/user";
import { ChangePasswordForm } from "@/components/profile/change-password";
import { PersonalInfoForm } from "@/components/profile/profile-info";
import { DangerZone } from "@/components/profile/danger-zone";

export default function ProfileContent({ user }: { user: UserDTO }) {
  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>

      {/* PERSONAL */}
      <TabsContent value="personal" className="space-y-6">
        <PersonalInfoForm user={user} />
      </TabsContent>

      {/* ACCOUNT */}
      <TabsContent value="account" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Account Status</Label>
                <p className="text-muted-foreground text-sm">
                  {user.active ? "Your account is active" : "Your account is disabled"}
                </p>
              </div>

              <Badge
                variant="outline"
                className={
                  user.active
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }
              >
                {user.active ? "Active" : "Disabled"}
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Role</Label>
                <p className="text-muted-foreground text-sm">{user.roleName}</p>
              </div>

              <Badge variant="secondary">{user.roleName}</Badge>
            </div>
          </CardContent>
        </Card>

        <ChangePasswordForm />

        {/* DELETE ACCOUNT */}
        <DangerZone userId={user.id} />
      </TabsContent>
    </Tabs>
  );
}
