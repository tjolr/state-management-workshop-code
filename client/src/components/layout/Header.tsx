import { KanbanSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsBar } from "@/components/shared/StatsBar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface HeaderProps {
  onCreateTask: () => void;
}

export function Header({ onCreateTask }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <KanbanSquare className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Kanban Board</h1>
        </div>
        <div className="hidden md:block">
          <StatsBar />
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onCreateTask}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
