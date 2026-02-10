import { Hono } from "hono";
import db from "../db/connection.js";

const users = new Hono();

users.get("/", (c) => {
  const rows = db.prepare("SELECT * FROM users").all() as Array<{
    id: string;
    name: string;
    avatar_url: string;
  }>;

  return c.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      avatarUrl: r.avatar_url,
    }))
  );
});

export default users;
