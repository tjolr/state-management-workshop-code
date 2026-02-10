import { Hono } from "hono";
import { nanoid } from "nanoid";
import db from "../db/connection.js";

// ── Row types coming back from SQLite ────────────────────────────────────────

interface TaskRow {
  id: string;
  title: string;
  description: string;
  state: string;
  tags: string;
  position: number;
  created_at: string;
  updated_at: string;
}

interface AssigneeRow {
  task_id: string;
  user_id: string;
  name: string;
  avatar_url: string;
}

interface CommentRow {
  id: string;
  task_id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string;
  text: string;
  created_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function hydrateTask(
  task: TaskRow,
  assignees: AssigneeRow[],
  comments: CommentRow[]
) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    state: task.state,
    tags: JSON.parse(task.tags) as string[],
    position: task.position,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    assignees: assignees
      .filter((a) => a.task_id === task.id)
      .map((a) => ({
        id: a.user_id,
        name: a.name,
        avatarUrl: a.avatar_url,
      })),
    comments: comments
      .filter((c) => c.task_id === task.id)
      .map((c) => ({
        id: c.id,
        author: {
          id: c.author_id,
          name: c.author_name,
          avatarUrl: c.author_avatar_url,
        },
        text: c.text,
        createdAt: c.created_at,
      })),
  };
}

function getAllAssignees(taskIds: string[]): AssigneeRow[] {
  if (taskIds.length === 0) return [];
  const placeholders = taskIds.map(() => "?").join(",");
  return db
    .prepare(
      `SELECT ta.task_id, ta.user_id, u.name, u.avatar_url
       FROM task_assignees ta
       JOIN users u ON u.id = ta.user_id
       WHERE ta.task_id IN (${placeholders})`
    )
    .all(...taskIds) as AssigneeRow[];
}

function getAllComments(taskIds: string[]): CommentRow[] {
  if (taskIds.length === 0) return [];
  const placeholders = taskIds.map(() => "?").join(",");
  return db
    .prepare(
      `SELECT c.id, c.task_id, c.author_id, u.name as author_name,
              u.avatar_url as author_avatar_url, c.text, c.created_at
       FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.task_id IN (${placeholders})
       ORDER BY c.created_at ASC`
    )
    .all(...taskIds) as CommentRow[];
}

function normalizePositions(state: string) {
  const tasks = db
    .prepare(
      "SELECT id FROM tasks WHERE state = ? ORDER BY position ASC, created_at ASC"
    )
    .all(state) as Array<{ id: string }>;
  const update = db.prepare("UPDATE tasks SET position = ? WHERE id = ?");
  for (let i = 0; i < tasks.length; i++) {
    update.run(i, tasks[i].id);
  }
}

// ── Routes ───────────────────────────────────────────────────────────────────

const tasks = new Hono();

// GET / - All tasks (fully hydrated)
tasks.get("/", (c) => {
  const rows = db
    .prepare("SELECT * FROM tasks ORDER BY state, position ASC")
    .all() as TaskRow[];
  const taskIds = rows.map((r) => r.id);
  const assignees = getAllAssignees(taskIds);
  const comments = getAllComments(taskIds);

  return c.json(rows.map((t) => hydrateTask(t, assignees, comments)));
});

// POST /reorder - Bulk reorder tasks (must be before /:id to avoid param match)
tasks.post("/reorder", async (c) => {
  const body = await c.req.json<{
    tasks: Array<{ id: string; state: string; position: number }>;
  }>();

  if (!body.tasks || !Array.isArray(body.tasks)) {
    return c.json({ error: "tasks array is required" }, 400);
  }

  const reorder = db.transaction(() => {
    const update = db.prepare(
      "UPDATE tasks SET state = ?, position = ?, updated_at = datetime('now') WHERE id = ?"
    );
    for (const t of body.tasks) {
      update.run(t.state, t.position, t.id);
    }
  });

  reorder();

  return c.json({ success: true });
});

// GET /:id - Single task (fully hydrated)
tasks.get("/:id", (c) => {
  const id = c.req.param("id");
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | TaskRow
    | undefined;
  if (!task) return c.json({ error: "Task not found" }, 404);

  const assignees = getAllAssignees([id]);
  const comments = getAllComments([id]);

  return c.json(hydrateTask(task, assignees, comments));
});

// POST / - Create task
tasks.post("/", async (c) => {
  const body = await c.req.json<{
    title: string;
    description?: string;
    state?: string;
    tags?: string[];
    assigneeIds?: string[];
  }>();

  if (!body.title) {
    return c.json({ error: "Title is required" }, 400);
  }

  const id = nanoid();
  const state = body.state ?? "Backlog";

  // Get the next position in the target state
  const maxPos = db
    .prepare("SELECT MAX(position) as max FROM tasks WHERE state = ?")
    .get(state) as { max: number | null };
  const position = (maxPos.max ?? -1) + 1;

  const create = db.transaction(() => {
    db.prepare(
      `INSERT INTO tasks (id, title, description, state, tags, position)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      body.title,
      body.description ?? "",
      state,
      JSON.stringify(body.tags ?? []),
      position
    );

    if (body.assigneeIds && body.assigneeIds.length > 0) {
      const insertAssignee = db.prepare(
        "INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)"
      );
      for (const userId of body.assigneeIds) {
        insertAssignee.run(id, userId);
      }
    }
  });

  create();

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow;
  const assignees = getAllAssignees([id]);
  const comments = getAllComments([id]);

  return c.json(hydrateTask(task, assignees, comments), 201);
});

// PATCH /:id - Update task
tasks.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | TaskRow
    | undefined;
  if (!existing) return c.json({ error: "Task not found" }, 404);

  const body = await c.req.json<{
    title?: string;
    description?: string;
    state?: string;
    tags?: string[];
    position?: number;
    assigneeIds?: string[];
  }>();

  const update = db.transaction(() => {
    const fields: string[] = ["updated_at = datetime('now')"];
    const values: unknown[] = [];

    if (body.title !== undefined) {
      fields.push("title = ?");
      values.push(body.title);
    }
    if (body.description !== undefined) {
      fields.push("description = ?");
      values.push(body.description);
    }
    if (body.state !== undefined) {
      fields.push("state = ?");
      values.push(body.state);
    }
    if (body.tags !== undefined) {
      fields.push("tags = ?");
      values.push(JSON.stringify(body.tags));
    }
    if (body.position !== undefined) {
      fields.push("position = ?");
      values.push(body.position);
    }

    values.push(id);
    db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(
      ...values
    );

    if (body.assigneeIds !== undefined) {
      db.prepare("DELETE FROM task_assignees WHERE task_id = ?").run(id);
      const insertAssignee = db.prepare(
        "INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)"
      );
      for (const userId of body.assigneeIds) {
        insertAssignee.run(id, userId);
      }
    }
  });

  update();

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow;
  const assignees = getAllAssignees([id]);
  const comments = getAllComments([id]);

  return c.json(hydrateTask(task, assignees, comments));
});

// DELETE /:id - Delete task
tasks.delete("/:id", (c) => {
  const id = c.req.param("id");
  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | TaskRow
    | undefined;
  if (!existing) return c.json({ error: "Task not found" }, 404);

  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  normalizePositions(existing.state);

  return c.json({ success: true });
});

// PATCH /:id/move - Move task to a new state + position
tasks.patch("/:id/move", async (c) => {
  const id = c.req.param("id");
  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | TaskRow
    | undefined;
  if (!existing) return c.json({ error: "Task not found" }, 404);

  const body = await c.req.json<{ state: string; position: number }>();

  if (!body.state || body.position === undefined) {
    return c.json({ error: "state and position are required" }, 400);
  }

  const sourceState = existing.state;
  const destState = body.state;

  const move = db.transaction(() => {
    // Remove from source column (shift positions down)
    db.prepare(
      "UPDATE tasks SET position = position - 1 WHERE state = ? AND position > ?"
    ).run(sourceState, existing.position);

    // Make room in destination column (shift positions up)
    db.prepare(
      "UPDATE tasks SET position = position + 1 WHERE state = ? AND position >= ?"
    ).run(destState, body.position);

    // Move the task
    db.prepare(
      "UPDATE tasks SET state = ?, position = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(destState, body.position, id);

    // Normalize both columns to keep positions clean
    normalizePositions(sourceState);
    if (sourceState !== destState) {
      normalizePositions(destState);
    }
  });

  move();

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow;
  const assignees = getAllAssignees([id]);
  const comments = getAllComments([id]);

  return c.json(hydrateTask(task, assignees, comments));
});

export default tasks;
