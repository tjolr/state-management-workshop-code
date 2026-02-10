import type { Task, TaskState } from "./index";

export interface CreateTaskInput {
  title: string;
  description?: string;
  state?: TaskState;
  assigneeIds?: string[];
  tags?: string[];
}

export interface UpdateTaskInput {
  id: string;
  data: Partial<Pick<Task, "title" | "description" | "tags" | "state">> & {
    assigneeIds?: string[];
  };
}

export interface MoveTaskInput {
  id: string;
  state: TaskState;
  position: number;
}

export interface ReorderTaskEntry {
  id: string;
  state: TaskState;
  position: number;
}

export interface AddCommentInput {
  taskId: string;
  authorId: string;
  text: string;
}

export interface DeleteCommentInput {
  taskId: string;
  commentId: string;
}
