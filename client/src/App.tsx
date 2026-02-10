import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { FilterBar } from "@/components/layout/FilterBar";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { TaskDialog } from "@/components/task/TaskDialog";
import { useTasks } from "@/state-management";
import type { Task, TaskState } from "@/types";

export default function App() {
  const { isLoading, error } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultState, setDefaultState] = useState<TaskState>("Backlog");

  const handleCreateTask = useCallback(
    (state?: TaskState) => {
      setSelectedTask(null);
      setDefaultState(state ?? "Backlog");
      setDialogOpen(true);
    },
    []
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Failed to load tasks</h2>
          <p className="text-sm text-muted-foreground">
            Make sure the server is running on port 3001.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center px-4">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          </div>
        </header>
        <div className="flex flex-1 gap-4 overflow-x-auto p-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[300px] shrink-0 animate-pulse rounded-lg bg-muted/50"
              style={{ height: "60vh" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onCreateTask={() => handleCreateTask()} />
      <FilterBar />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          onTaskClick={handleTaskClick}
          onCreateTask={handleCreateTask}
        />
      </div>
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        defaultState={defaultState}
      />
    </div>
  );
}
