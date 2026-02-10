import type { TagType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tagColors: Record<TagType, string> = {
  app: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  api: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  db: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  devops: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

interface TagBadgeProps {
  tag: TagType;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function TagBadge({ tag, className, onClick, active }: TagBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        tagColors[tag],
        "border-0 text-[11px] font-medium",
        onClick && "cursor-pointer hover:opacity-80",
        active === false && "opacity-40",
        className
      )}
      onClick={onClick}
    >
      {tag}
    </Badge>
  );
}
