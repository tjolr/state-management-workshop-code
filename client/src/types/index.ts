export type TagType = "app" | "api" | "db" | "devops";
export type TaskState = "Backlog" | "Todo" | "InProgress" | "Done";
export type Theme = "light" | "dark" | "system";
export type SortField = "title" | "createdAt" | "assigneeCount" | "manual";
export type SortDirection = "asc" | "desc";

export const TASK_STATES: TaskState[] = [
  "Backlog",
  "Todo",
  "InProgress",
  "Done",
];
export const ALL_TAGS: TagType[] = ["app", "api", "db", "devops"];

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  state: TaskState;
  title: string;
  description: string;
  assignees: User[];
  tags: TagType[];
  comments: Comment[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  tags: TagType[];
  collapsedColumns: TaskState[];
  hiddenColumns: TaskState[];
}

export interface SortingState {
  field: SortField;
  direction: SortDirection;
}
