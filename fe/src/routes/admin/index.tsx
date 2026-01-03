import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Het Tien Roi Em Oi</div>;
}
