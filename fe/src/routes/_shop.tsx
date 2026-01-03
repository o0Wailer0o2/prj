import { Navigation } from "@/components/navigation/navigation";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_shop")({ component: ShopLayout });

function ShopLayout() {
  return (
    <div className="w-full overflow-x-hidden">
      <Navigation />
      <div className="w-full overflow-x-hidden pt-30">
        <Outlet />
      </div>
    </div>
  );
}
