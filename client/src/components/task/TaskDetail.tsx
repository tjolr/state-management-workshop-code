import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TagBadge } from "@/components/shared/TagBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommentSection } from "./CommentSection";
import {
  ALL_TAGS,
  TASK_STATES,
  type Task,
  type TaskState,
  type TagType,
  type User,
} from "@/types";

const stateLabels: Record<TaskState, string> = {
  Backlog: "Backlog",
  Todo: "To Do",
  InProgress: "In Progress",
  Done: "Done",
};

interface TaskDetailProps {
  task: Task;
  users: User[];
  onUpdate: (data: Partial<Pick<Task, "title" | "description" | "tags"> & { assigneeIds: string[] }>) => Promise<void>;
  onMove: (state: TaskState) => Promise<void>;
  onDelete: () => Promise<void>;
  onAddComment: (authorId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function TaskDetail({
  task,
  users,
  onUpdate,
  onMove,
  onDelete,
  onAddComment,
  onDeleteComment,
}: TaskDetailProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTitle = async () => {
    if (title !== task.title) {
      setIsSaving(true);
      try {
        await onUpdate({ title });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveDescription = async () => {
    if (description !== task.description) {
      setIsSaving(true);
      try {
        await onUpdate({ description });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleToggleTag = async (tag: TagType) => {
    const newTags = task.tags.includes(tag)
      ? task.tags.filter((t) => t !== tag)
      : [...task.tags, tag];
    await onUpdate({ tags: newTags });
  };

  const handleToggleAssignee = async (userId: string) => {
    const currentIds = task.assignees.map((a) => a.id);
    const newIds = currentIds.includes(userId)
      ? currentIds.filter((id) => id !== userId)
      : [...currentIds, userId];
    await onUpdate({ assigneeIds: newIds });
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSaveTitle}
          className="border-0 px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          disabled={isSaving}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Select
          value={task.state}
          onValueChange={(v) => onMove(v as TaskState)}
        >
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {stateLabels[state]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <span className="text-sm text-muted-foreground">Description:</span>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSaveDescription}
          placeholder="Add a description..."
          className="mt-1 min-h-[80px]"
          disabled={isSaving}
        />
      </div>

      <Separator />

      <div>
        <span className="text-sm text-muted-foreground">Tags:</span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              onClick={() => handleToggleTag(tag)}
              active={task.tags.includes(tag)}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm text-muted-foreground">Assignees:</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {users.map((user) => {
            const isAssigned = task.assignees.some((a) => a.id === user.id);
            return (
              <button
                key={user.id}
                onClick={() => handleToggleAssignee(user.id)}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition-colors ${
                  isAssigned
                    ? "border-primary bg-primary/10"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <UserAvatar user={user} size="sm" showTooltip={false} />
                <span>{user.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      <CommentSection
        comments={task.comments}
        users={users}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Created {new Date(task.createdAt).toLocaleDateString()}
        </span>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete Task
        </Button>
      </div>
    </div>
  );
}
