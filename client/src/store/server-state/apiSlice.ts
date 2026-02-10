import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createSelector } from "@reduxjs/toolkit";
import type { Comment, Task, User, TagType, TaskState } from "@/types";
import { ALL_TAGS, TASK_STATES } from "@/types";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  ReorderTaskEntry,
  AddCommentInput,
  DeleteCommentInput,
} from "@/types/api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Task", "User", "Comment"],
  endpoints: (builder) => ({
    // ── Tasks ──────────────────────────────────────────────────────────

    getTasks: builder.query<Task[], void>({
      query: () => "/tasks",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Task" as const, id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),

    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Task", id }],
    }),

    createTask: builder.mutation<Task, CreateTaskInput>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    updateTask: builder.mutation<Task, UpdateTaskInput>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Task", id: "LIST" },
        { type: "Task", id },
      ],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    moveTask: builder.mutation<Task, MoveTaskInput>({
      query: ({ id, state, position }) => ({
        url: `/tasks/${id}/move`,
        method: "PATCH",
        body: { state, position },
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    reorderTasks: builder.mutation<void, ReorderTaskEntry[]>({
      query: (tasks) => ({
        url: "/tasks/reorder",
        method: "POST",
        body: { tasks },
      }),
      async onQueryStarted(tasks, { dispatch, queryFulfilled }) {
        // Optimistic update: patch the getTasks cache immediately
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getTasks", undefined, (draft) => {
            for (const update of tasks) {
              const task = draft.find((t) => t.id === update.id);
              if (task) {
                task.state = update.state;
                task.position = update.position;
              }
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),

    // ── Users ──────────────────────────────────────────────────────────

    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // ── Comments ───────────────────────────────────────────────────────

    getComments: builder.query<Comment[], string>({
      query: (taskId) => `/tasks/${taskId}/comments`,
      providesTags: (_result, _error, taskId) => [
        { type: "Comment", id: taskId },
      ],
    }),

    addComment: builder.mutation<Comment, AddCommentInput>({
      query: ({ taskId, authorId, text }) => ({
        url: `/tasks/${taskId}/comments`,
        method: "POST",
        body: { authorId, text },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Comment", id: taskId },
        { type: "Task", id: "LIST" },
      ],
    }),

    deleteComment: builder.mutation<void, DeleteCommentInput>({
      query: ({ taskId, commentId }) => ({
        url: `/tasks/${taskId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Comment", id: taskId },
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useReorderTasksMutation,
  useGetUsersQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
} = apiSlice;

// ── Derived selectors ─────────────────────────────────────────────────

const selectTasksResult = apiSlice.endpoints.getTasks.select();
const selectTasks = createSelector(
  selectTasksResult,
  (result) => result.data ?? [],
);

const selectByColumn = createSelector(selectTasks, (tasks) => {
  const counts = {} as Record<TaskState, number>;
  for (const state of TASK_STATES) counts[state] = 0;
  for (const task of tasks) {
    if (counts[task.state] !== undefined) counts[task.state]++;
  }
  return counts;
});

const selectByTag = createSelector(selectTasks, (tasks) => {
  const counts = {} as Record<TagType, number>;
  for (const tag of ALL_TAGS) counts[tag] = 0;
  for (const task of tasks) {
    for (const tag of task.tags) {
      if (counts[tag] !== undefined) counts[tag]++;
    }
  }
  return counts;
});

export const selectTaskStats = createSelector(
  selectTasks,
  selectByColumn,
  selectByTag,
  (tasks, byColumn, byTag) => {
    const totalTasks = tasks.length;
    const completedPercent =
      totalTasks === 0 ? 0 : Math.round(((byColumn.Done ?? 0) / totalTasks) * 100);
    return { totalTasks, byColumn, byTag, completedPercent };
  },
);
