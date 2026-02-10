import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCardOverlay } from "./TaskCardOverlay";
import { useTasks, useFilters } from "@/hooks";
import { TASK_STATES, type Task, type TaskState } from "@/types";

interface KanbanBoardProps {
  onTaskClick: (task: Task) => void;
  onCreateTask: (state?: TaskState) => void;
}

export function KanbanBoard({ onTaskClick, onCreateTask }: KanbanBoardProps) {
  const { tasksByColumn, reorderTasks, moveTask } = useTasks();
  const { isColumnHidden } = useFilters();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = active.data.current?.task as Task | undefined;
      if (task) {
        setActiveTask(task);
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (_event: DragOverEvent) => {
      // Visual feedback handled by droppable isOver state
    },
    []
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over || !active.data.current?.task) return;

      const draggedTask = active.data.current.task as Task;
      let targetState: TaskState;
      let targetPosition: number;

      if (over.data.current?.type === "column") {
        // Dropped on a column
        targetState = over.data.current.state as TaskState;
        const columnTasks = tasksByColumn[targetState] || [];
        targetPosition = columnTasks.length;
      } else if (over.data.current?.type === "task") {
        // Dropped on another task
        const overTask = over.data.current.task as Task;
        targetState = overTask.state;
        const columnTasks = tasksByColumn[targetState] || [];
        const overIndex = columnTasks.findIndex((t) => t.id === overTask.id);
        targetPosition = overIndex >= 0 ? overIndex : columnTasks.length;
      } else {
        return;
      }

      if (
        draggedTask.state === targetState &&
        draggedTask.position === targetPosition
      ) {
        return;
      }

      // Build updated positions for the affected column(s)
      const updates: Array<{
        id: string;
        state: TaskState;
        position: number;
      }> = [];

      if (draggedTask.state === targetState) {
        // Same column reorder
        const columnTasks = [...(tasksByColumn[targetState] || [])];
        const fromIndex = columnTasks.findIndex(
          (t) => t.id === draggedTask.id
        );
        if (fromIndex === -1) return;

        columnTasks.splice(fromIndex, 1);
        columnTasks.splice(targetPosition, 0, draggedTask);

        columnTasks.forEach((t, i) => {
          updates.push({ id: t.id, state: targetState, position: i });
        });
      } else {
        // Cross-column move
        const sourceColumn = [...(tasksByColumn[draggedTask.state] || [])];
        const destColumn = [...(tasksByColumn[targetState] || [])];

        // Remove from source
        const fromIndex = sourceColumn.findIndex(
          (t) => t.id === draggedTask.id
        );
        if (fromIndex !== -1) sourceColumn.splice(fromIndex, 1);

        // Add to destination
        destColumn.splice(targetPosition, 0, {
          ...draggedTask,
          state: targetState,
        });

        // Update source positions
        sourceColumn.forEach((t, i) => {
          updates.push({ id: t.id, state: draggedTask.state, position: i });
        });

        // Update destination positions
        destColumn.forEach((t, i) => {
          updates.push({ id: t.id, state: targetState, position: i });
        });
      }

      if (updates.length > 0) {
        try {
          await reorderTasks(updates);
        } catch {
          // Optimistic update will revert on error
        }
      }
    },
    [tasksByColumn, reorderTasks, moveTask]
  );

  const visibleStates = TASK_STATES.filter((s) => !isColumnHidden(s));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {visibleStates.map((state) => (
          <KanbanColumn
            key={state}
            state={state}
            tasks={tasksByColumn[state] || []}
            onTaskClick={onTaskClick}
            onCreateTask={onCreateTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
