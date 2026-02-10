import { Hono } from "hono";
import { nanoid } from "nanoid";
import db from "../db/connection.js";

interface CommentRow {
  id: string;
  task_id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string;
  text: string;
  created_at: string;
}

const comments = new Hono();

// GET /:taskId/comments - Get all comments for a task
comments.get("/:taskId/comments", (c) => {
  const taskId = c.req.param("taskId");

  const task = db.prepare("SELECT id FROM tasks WHERE id = ?").get(taskId);
  if (!task) return c.json({ error: "Task not found" }, 404);

  const rows = db
    .prepare(
      `SELECT c.id, c.task_id, c.author_id, u.name as author_name,
              u.avatar_url as author_avatar_url, c.text, c.created_at
       FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`
    )
    .all(taskId) as CommentRow[];

  return c.json(
    rows.map((r) => ({
      id: r.id,
      author: {
        id: r.author_id,
        name: r.author_name,
        avatarUrl: r.author_avatar_url,
      },
      text: r.text,
      createdAt: r.created_at,
    }))
  );
});

// POST /:taskId/comments - Add a comment to a task
comments.post("/:taskId/comments", async (c) => {
  const taskId = c.req.param("taskId");

  const task = db.prepare("SELECT id FROM tasks WHERE id = ?").get(taskId);
  if (!task) return c.json({ error: "Task not found" }, 404);

  const body = await c.req.json<{ authorId: string; text: string }>();

  if (!body.authorId || !body.text) {
    return c.json({ error: "authorId and text are required" }, 400);
  }

  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(body.authorId);
  if (!user) return c.json({ error: "User not found" }, 404);

  const id = nanoid();
  db.prepare(
    "INSERT INTO comments (id, task_id, author_id, text) VALUES (?, ?, ?, ?)"
  ).run(id, taskId, body.authorId, body.text);

  const row = db
    .prepare(
      `SELECT c.id, c.task_id, c.author_id, u.name as author_name,
              u.avatar_url as author_avatar_url, c.text, c.created_at
       FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.id = ?`
    )
    .get(id) as CommentRow;

  return c.json(
    {
      id: row.id,
      author: {
        id: row.author_id,
        name: row.author_name,
        avatarUrl: row.author_avatar_url,
      },
      text: row.text,
      createdAt: row.created_at,
    },
    201
  );
});

// DELETE /:taskId/comments/:commentId - Delete a comment
comments.delete("/:taskId/comments/:commentId", (c) => {
  const taskId = c.req.param("taskId");
  const commentId = c.req.param("commentId");

  const comment = db
    .prepare("SELECT id FROM comments WHERE id = ? AND task_id = ?")
    .get(commentId, taskId);
  if (!comment) return c.json({ error: "Comment not found" }, 404);

  db.prepare("DELETE FROM comments WHERE id = ?").run(commentId);

  return c.json({ success: true });
});

export default comments;
