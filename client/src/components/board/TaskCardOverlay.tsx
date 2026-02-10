import { Card } from "@/components/ui/card";
import { TagBadge } from "@/components/shared/TagBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { GripVertical, MessageSquare } from "lucide-react";
import type { Task } from "@/types";

interface TaskCardOverlayProps {
  task: Task;
}

export function TaskCardOverlay({ task }: TaskCardOverlayProps) {
  return (
    <Card className="w-[280px] p-3 shadow-lg ring-2 ring-primary/20">
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground" />
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
