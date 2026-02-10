import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSorting } from "@/hooks";
import type { SortField } from "@/types";

const sortLabels: Record<SortField, string> = {
  manual: "Manual",
  title: "Title",
  createdAt: "Created",
  assigneeCount: "Assignees",
};

export function SortControl() {
  const { sorting, setSortField, toggleSortDirection } = useSorting();

  return (
    <div className="flex items-center gap-1">
      <Select
        value={sorting.field}
        onValueChange={(v) => setSortField(v as SortField)}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(sortLabels) as SortField[]).map((field) => (
            <SelectItem key={field} value={field}>
              {sortLabels[field]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={toggleSortDirection}
        disabled={sorting.field === "manual"}
      >
        {sorting.field === "manual" ? (
          <ArrowUpDown className="h-3.5 w-3.5" />
        ) : sorting.direction === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
