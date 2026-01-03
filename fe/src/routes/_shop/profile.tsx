import ProfileContent from "@/components/profile/profile-content";
import ProfileHeader from "@/components/profile/profile-header";
import { createGetMeQueryOptions } from "@/lib/tanstack/options/user";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shop/profile")({
  component: RouteComponent
});

function RouteComponent() {
  const { data: user, isError, isLoading } = useQuery(createGetMeQueryOptions());

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-destructive">Failed to load profile.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-muted-foreground">You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <ProfileHeader user={user} />
      <ProfileContent user={user} />
    </div>
  );
}
