import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TagBadge } from "@/components/shared/TagBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  overlay?: boolean;
}

export function TaskCard({ task, onClick, overlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={overlay ? undefined : style}
      className={cn(
        "group cursor-pointer p-3 transition-shadow hover:shadow-md",
        isDragging && "opacity-50",
        overlay && "shadow-lg ring-2 ring-primary/20"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab touch-none opacity-0 transition-opacity group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium leading-snug">{task.title}</p>
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 3).map((user) => (
                <UserAvatar key={user.id} user={user} size="sm" />
              ))}
              {task.assignees.length > 3 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                  +{task.assignees.length - 3}
                </span>
              )}
            </div>
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">{task.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
