import { Button } from "@/components/ui/button";
import { useRouter, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";

interface Props {
  orientation?: "horizontal" | "vertical";
}

export function CategoryNav({ orientation = "horizontal" }: Props) {
  const setTypes = useSearchStore((s) => s.setTypes);
  const router = useRouter();
  const location = useLocation();

  const go = (type: "BOOK" | "CD" | "DVD" | "NEWSPAPER") => {
    setTypes([type]);
    if (location.pathname !== "/search") {
      router.navigate({ to: "/search" });
    }
  };

  const items = [
    { label: "Books", type: "BOOK" },
    { label: "DVDs & Movies", type: "DVD" },
    { label: "Music CDs", type: "CD" },
    { label: "News & Magazines", type: "NEWSPAPER" }
  ] as const;

  return (
    <nav
      className={cn(
        orientation === "horizontal" ? "hidden items-center gap-6 lg:flex" : "flex flex-col gap-2"
      )}
    >
      {items.map((item) => (
        <Button
          key={item.type}
          variant="ghost"
          className={cn(
            "hover:text-primary px-0 font-medium",
            orientation === "horizontal" ? "text-sm" : "justify-start text-base"
          )}
          onClick={() => go(item.type)}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}
