"use client";

import * as React from "react";
import { Check, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types/order";

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" }
];

interface StatusFilterProps {
  selectedStatuses: OrderStatus[];
  onStatusChange: (statuses: OrderStatus[]) => void;
}

export function StatusFilter({ selectedStatuses, onStatusChange }: StatusFilterProps) {
  const [open, setOpen] = React.useState(false);

  const toggleStatus = (status: OrderStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    onStatusChange(newStatuses);
  };

  const clearAll = () => {
    onStatusChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-dashed bg-transparent">
          <Filter className="mr-2 h-4 w-4" />
          Status
          {selectedStatuses.length > 0 && (
            <>
              <div className="bg-border mx-2 h-4 w-px" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {selectedStatuses.length}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search status..." />
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {statusOptions.map((option) => {
                const isSelected = selectedStatuses.includes(option.value);
                return (
                  <CommandItem key={option.value} onSelect={() => toggleStatus(option.value)}>
                    <div
                      className={cn(
                        "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {selectedStatuses.length > 0 && (
            <>
              <div className="border-t p-1">
                <Button
                  variant="ghost"
                  onClick={clearAll}
                  className="w-full justify-center text-center"
                >
                  Clear filters
                </Button>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
