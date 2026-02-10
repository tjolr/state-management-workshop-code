import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagBadge } from "@/components/shared/TagBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { TaskDetail } from "./TaskDetail";
import {
  useTasks,
  useGetUsersQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
} from "@/state-management";
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

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  defaultState?: TaskState;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultState = "Backlog",
}: TaskDialogProps) {
  if (task) {
    return (
      <TaskDialogEdit
        open={open}
        onOpenChange={onOpenChange}
        task={task}
      />
    );
  }

  return (
    <TaskDialogCreate
      open={open}
      onOpenChange={onOpenChange}
      defaultState={defaultState}
    />
  );
}

function TaskDialogCreate({
  open,
  onOpenChange,
  defaultState,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultState: TaskState;
}) {
  const { createTask } = useTasks();
  const { data: users = [] } = useGetUsersQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState<TaskState>(defaultState);
  const [tags, setTags] = useState<TagType[]>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await createTask({ title: title.trim(), description, state, tags, assigneeIds });
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setState(defaultState);
      setTags([]);
      setAssigneeIds([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Add a new task to the board.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select value={state} onValueChange={(v) => setState(v as TaskState)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {stateLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Tags:</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {ALL_TAGS.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onClick={() =>
                    setTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag]
                    )
                  }
                  active={tags.includes(tag)}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Assignees:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {users.map((user: User) => {
                const isSelected = assigneeIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() =>
                      setAssigneeIds((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== user.id)
                          : [...prev, user.id]
                      )
                    }
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition-colors ${
                      isSelected
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
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
          >
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskDialogEdit({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}) {
  const { updateTask, deleteTask, moveTask } = useTasks();
  const { data: users = [] } = useGetUsersQuery();
  const [addComment] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Task</DialogTitle>
          <DialogDescription className="sr-only">
            Edit task details, manage assignees and comments.
          </DialogDescription>
        </DialogHeader>
        <TaskDetail
          task={task}
          users={users}
          onUpdate={async (data) => {
            await updateTask(task.id, data);
          }}
          onMove={async (state) => {
            await moveTask(task.id, state, 0);
          }}
          onDelete={async () => {
            await deleteTask(task.id);
            onOpenChange(false);
          }}
          onAddComment={async (authorId, text) => {
            await addComment({
              taskId: task.id,
              authorId,
              text,
            }).unwrap();
          }}
          onDeleteComment={async (commentId) => {
            await deleteComment({
              taskId: task.id,
              commentId,
            }).unwrap();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
