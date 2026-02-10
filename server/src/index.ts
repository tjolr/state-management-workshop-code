import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { initializeDb } from "./db/schema.js";
import { seedDb } from "./db/seed.js";
import tasks from "./routes/tasks.js";
import users from "./routes/users.js";
import comments from "./routes/comments.js";

const app = new Hono();

app.use("*", cors());

app.route("/api/users", users);
app.route("/api/tasks", tasks);
app.route("/api/tasks", comments);

initializeDb();
seedDb();

console.log("Server running on http://localhost:3001");
serve({ fetch: app.fetch, port: 3001 });
