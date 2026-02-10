import { nanoid } from "nanoid";
import db from "./connection.js";

export function seedDb() {
  const existing = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };
  if (existing.count > 0) return;

  const insertUser = db.prepare(
    "INSERT INTO users (id, name, avatar_url) VALUES (?, ?, ?)"
  );
  const insertTask = db.prepare(
    "INSERT INTO tasks (id, title, description, state, tags, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now'))"
  );
  const insertAssignee = db.prepare(
    "INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)"
  );
  const insertComment = db.prepare(
    "INSERT INTO comments (id, task_id, author_id, text, created_at) VALUES (?, ?, ?, ?, datetime('now', ?))"
  );

  const seed = db.transaction(() => {
    // ── Users ──────────────────────────────────────────────────────────
    const alice = nanoid();
    const bob = nanoid();
    const carol = nanoid();
    const dave = nanoid();
    const eve = nanoid();
    const frank = nanoid();

    const users = [
      { id: alice, name: "Alice Chen" },
      { id: bob, name: "Bob Martinez" },
      { id: carol, name: "Carol Kim" },
      { id: dave, name: "Dave Patel" },
      { id: eve, name: "Eve Johnson" },
      { id: frank, name: "Frank Liu" },
    ];

    for (const u of users) {
      const seed = u.name.split(" ")[0];
      insertUser.run(
        u.id,
        u.name,
        `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`
      );
    }

    // ── Tasks ──────────────────────────────────────────────────────────
    // Backlog (3)
    const t1 = nanoid();
    const t2 = nanoid();
    const t3 = nanoid();
    // Todo (4)
    const t4 = nanoid();
    const t5 = nanoid();
    const t6 = nanoid();
    const t7 = nanoid();
    // InProgress (4)
    const t8 = nanoid();
    const t9 = nanoid();
    const t10 = nanoid();
    const t11 = nanoid();
    // Done (3)
    const t12 = nanoid();
    const t13 = nanoid();
    const t14 = nanoid();

    const tasks = [
      // Backlog
      {
        id: t1,
        title: "Research caching strategies",
        description:
          "Investigate Redis, Memcached, and in-memory caching options. Compare performance characteristics and integration complexity for our stack.",
        state: "Backlog",
        tags: ["api", "db"],
        position: 0,
        age: "-10 days",
      },
      {
        id: t2,
        title: "Write API documentation",
        description:
          "Document all REST endpoints with request/response examples using OpenAPI 3.0 spec. Include authentication flows and error codes.",
        state: "Backlog",
        tags: ["api"],
        position: 1,
        age: "-9 days",
      },
      {
        id: t3,
        title: "Evaluate CI/CD tools",
        description:
          "Compare GitHub Actions, CircleCI, and GitLab CI for our deployment pipeline. Consider cost, speed, and ecosystem support.",
        state: "Backlog",
        tags: ["devops"],
        position: 2,
        age: "-8 days",
      },
      // Todo
      {
        id: t4,
        title: "Design user dashboard",
        description:
          "Create wireframes and high-fidelity mockups for the main user dashboard. Include data visualization widgets and activity feed.",
        state: "Todo",
        tags: ["app"],
        position: 0,
        age: "-8 days",
      },
      {
        id: t5,
        title: "Set up monitoring",
        description:
          "Configure application monitoring with Datadog or Grafana. Set up alerting for error rates, latency p99, and resource usage.",
        state: "Todo",
        tags: ["devops", "api"],
        position: 1,
        age: "-7 days",
      },
      {
        id: t6,
        title: "Create onboarding flow",
        description:
          "Build a multi-step onboarding wizard for new users. Include profile setup, preference selection, and guided tour of key features.",
        state: "Todo",
        tags: ["app"],
        position: 2,
        age: "-7 days",
      },
      {
        id: t7,
        title: "Add search functionality",
        description:
          "Implement full-text search across tasks and comments. Evaluate SQLite FTS5 vs external search service.",
        state: "Todo",
        tags: ["app", "db"],
        position: 3,
        age: "-6 days",
      },
      // InProgress
      {
        id: t8,
        title: "Implement auth system",
        description:
          "Build JWT-based authentication with refresh tokens. Include login, signup, password reset, and session management.",
        state: "InProgress",
        tags: ["api", "app"],
        position: 0,
        age: "-6 days",
      },
      {
        id: t9,
        title: "Build notification service",
        description:
          "Create a notification system supporting in-app, email, and push notifications. Include preference management and batching.",
        state: "InProgress",
        tags: ["api"],
        position: 1,
        age: "-5 days",
      },
      {
        id: t10,
        title: "Optimize database queries",
        description:
          "Profile slow queries and add appropriate indexes. Optimize N+1 queries in the task listing and comment fetching endpoints.",
        state: "InProgress",
        tags: ["db", "api"],
        position: 2,
        age: "-4 days",
      },
      {
        id: t11,
        title: "Refactor API endpoints",
        description:
          "Standardize API response format across all endpoints. Implement consistent error handling and input validation middleware.",
        state: "InProgress",
        tags: ["api"],
        position: 3,
        age: "-3 days",
      },
      // Done
      {
        id: t12,
        title: "Set up project structure",
        description:
          "Initialize monorepo with client and server packages. Configure TypeScript, ESLint, and Prettier. Set up shared type definitions.",
        state: "Done",
        tags: ["devops"],
        position: 0,
        age: "-14 days",
      },
      {
        id: t13,
        title: "Configure linting",
        description:
          "Set up ESLint with TypeScript support, Prettier for formatting, and husky pre-commit hooks. Add lint-staged for incremental linting.",
        state: "Done",
        tags: ["devops"],
        position: 1,
        age: "-13 days",
      },
      {
        id: t14,
        title: "Design database schema",
        description:
          "Design and implement the SQLite schema for users, tasks, assignees, and comments. Include proper foreign keys and indexes.",
        state: "Done",
        tags: ["db"],
        position: 2,
        age: "-12 days",
      },
    ];

    for (const t of tasks) {
      insertTask.run(
        t.id,
        t.title,
        t.description,
        t.state,
        JSON.stringify(t.tags),
        t.position,
        t.age
      );
    }

    // ── Assignees ──────────────────────────────────────────────────────
    const assignments: Array<[string, string]> = [
      [t1, alice],
      [t1, dave],
      [t2, bob],
      [t2, eve],
      [t3, carol],
      [t3, frank],
      [t4, alice],
      [t4, carol],
      [t5, dave],
      [t5, frank],
      [t6, alice],
      [t6, bob],
      [t6, eve],
      [t7, carol],
      [t7, dave],
      [t8, alice],
      [t8, bob],
      [t9, carol],
      [t9, frank],
      [t9, eve],
      [t10, dave],
      [t10, alice],
      [t11, bob],
      [t11, carol],
      [t12, frank],
      [t12, alice],
      [t12, dave],
      [t13, eve],
      [t13, bob],
      [t14, dave],
      [t14, carol],
    ];

    for (const [taskId, userId] of assignments) {
      insertAssignee.run(taskId, userId);
    }

    // ── Comments ───────────────────────────────────────────────────────
    const comments: Array<{
      taskId: string;
      authorId: string;
      text: string;
      age: string;
    }> = [
      // t1 - Research caching strategies
      {
        taskId: t1,
        authorId: alice,
        text: "I've started a comparison doc for Redis vs Memcached. Redis looks more versatile for our use case since we need pub/sub too.",
        age: "-9 days",
      },
      {
        taskId: t1,
        authorId: dave,
        text: "Good call. We should also benchmark with our actual query patterns, not just synthetic loads.",
        age: "-9 days",
      },
      {
        taskId: t1,
        authorId: frank,
        text: "Have we considered using SQLite's built-in cache? Might be enough for our current scale.",
        age: "-8 days",
      },

      // t2 - Write API documentation
      {
        taskId: t2,
        authorId: bob,
        text: "I'll use Swagger UI for the interactive docs. Should we host them on a separate subdomain?",
        age: "-8 days",
      },
      {
        taskId: t2,
        authorId: eve,
        text: "Subdomain would be clean. Also make sure to include rate limit headers in the examples.",
        age: "-7 days",
      },
      {
        taskId: t2,
        authorId: alice,
        text: "Can we auto-generate the OpenAPI spec from our Hono route definitions? That would keep docs in sync.",
        age: "-7 days",
      },

      // t3 - Evaluate CI/CD tools
      {
        taskId: t3,
        authorId: carol,
        text: "GitHub Actions is the obvious choice since we're already on GitHub. Free tier should cover us for now.",
        age: "-7 days",
      },
      {
        taskId: t3,
        authorId: frank,
        text: "Agreed, but let's also consider self-hosted runners for the heavier integration tests.",
        age: "-6 days",
      },

      // t4 - Design user dashboard
      {
        taskId: t4,
        authorId: alice,
        text: "First round of wireframes are in Figma. Let me know what you think about the layout.",
        age: "-7 days",
      },
      {
        taskId: t4,
        authorId: carol,
        text: "The activity feed placement feels right. Can we add a quick-action bar at the top?",
        age: "-6 days",
      },
      {
        taskId: t4,
        authorId: bob,
        text: "Love the widget approach. We should make them draggable so users can customize their view.",
        age: "-6 days",
      },

      // t5 - Set up monitoring
      {
        taskId: t5,
        authorId: dave,
        text: "Grafana + Prometheus stack is my recommendation. We can self-host and keep costs down.",
        age: "-6 days",
      },
      {
        taskId: t5,
        authorId: frank,
        text: "Let's add structured logging with pino first, then pipe to Grafana Loki. That way we get logs + metrics.",
        age: "-5 days",
      },
      {
        taskId: t5,
        authorId: alice,
        text: "Don't forget to set up PagerDuty integration for critical alerts. Nobody wants to miss a P0.",
        age: "-5 days",
      },

      // t6 - Create onboarding flow
      {
        taskId: t6,
        authorId: bob,
        text: "I'm thinking a 3-step wizard: profile, preferences, guided tour. Keep it under 2 minutes total.",
        age: "-6 days",
      },
      {
        taskId: t6,
        authorId: eve,
        text: "Make sure we add a skip option. Power users hate being forced through tutorials.",
        age: "-5 days",
      },
      {
        taskId: t6,
        authorId: alice,
        text: "We should track completion rates at each step to identify drop-off points.",
        age: "-5 days",
      },

      // t7 - Add search functionality
      {
        taskId: t7,
        authorId: carol,
        text: "SQLite FTS5 would be simplest to start with. We can migrate to Meilisearch later if needed.",
        age: "-5 days",
      },
      {
        taskId: t7,
        authorId: dave,
        text: "FTS5 is surprisingly good. We should add trigram matching for typo tolerance though.",
        age: "-4 days",
      },

      // t8 - Implement auth system
      {
        taskId: t8,
        authorId: alice,
        text: "JWT access tokens with 15min expiry, refresh tokens in httpOnly cookies with 7-day expiry. Sound good?",
        age: "-5 days",
      },
      {
        taskId: t8,
        authorId: bob,
        text: "Looks solid. Let's also add token rotation on refresh to prevent replay attacks.",
        age: "-4 days",
      },
      {
        taskId: t8,
        authorId: dave,
        text: "Don't forget to blacklist tokens on logout. We can use a Redis set with TTL matching the token expiry.",
        age: "-3 days",
      },

      // t9 - Build notification service
      {
        taskId: t9,
        authorId: carol,
        text: "I'm setting up a notification queue with BullMQ. We can batch email notifications to avoid spamming users.",
        age: "-4 days",
      },
      {
        taskId: t9,
        authorId: frank,
        text: "Good idea on batching. Can we do a daily digest option as well?",
        age: "-3 days",
      },
      {
        taskId: t9,
        authorId: eve,
        text: "The in-app notification bell is wired up. Just need the WebSocket connection for real-time updates.",
        age: "-2 days",
      },

      // t10 - Optimize database queries
      {
        taskId: t10,
        authorId: dave,
        text: "Found the N+1 issue - we're fetching comments one task at a time. Switching to a batched query.",
        age: "-3 days",
      },
      {
        taskId: t10,
        authorId: alice,
        text: "Added an index on task_assignees(user_id). The user task listing query went from 45ms to 3ms.",
        age: "-2 days",
      },
      {
        taskId: t10,
        authorId: bob,
        text: "Nice improvement! Can we also add EXPLAIN QUERY PLAN output to our test suite as a regression check?",
        age: "-1 days",
      },

      // t11 - Refactor API endpoints
      {
        taskId: t11,
        authorId: bob,
        text: "I've standardized the error response format: { error: { code, message, details? } }. PR is up.",
        age: "-2 days",
      },
      {
        taskId: t11,
        authorId: carol,
        text: "Looks clean. Let's also add request validation with zod schemas at the middleware level.",
        age: "-1 days",
      },

      // t12 - Set up project structure
      {
        taskId: t12,
        authorId: frank,
        text: "Monorepo is set up with npm workspaces. Client and server packages are building independently.",
        age: "-13 days",
      },
      {
        taskId: t12,
        authorId: alice,
        text: "Shared types package is working great. No more duplicating interfaces between client and server.",
        age: "-12 days",
      },
      {
        taskId: t12,
        authorId: dave,
        text: "Added path aliases for cleaner imports. @shared/types, @server/db, etc.",
        age: "-12 days",
      },

      // t13 - Configure linting
      {
        taskId: t13,
        authorId: eve,
        text: "ESLint + Prettier configured. Using the recommended TypeScript rules with a few tweaks for our style.",
        age: "-12 days",
      },
      {
        taskId: t13,
        authorId: bob,
        text: "Husky pre-commit hooks are running lint-staged. Only changed files get linted, so it's fast.",
        age: "-11 days",
      },

      // t14 - Design database schema
      {
        taskId: t14,
        authorId: dave,
        text: "Schema is finalized. Using TEXT primary keys with nanoid for better distribution than auto-increment.",
        age: "-11 days",
      },
      {
        taskId: t14,
        authorId: carol,
        text: "Added cascade deletes on foreign keys. When a task is deleted, assignees and comments go with it.",
        age: "-11 days",
      },
      {
        taskId: t14,
        authorId: alice,
        text: "The JSON column for tags works well with SQLite's json functions. We can query by tag if needed.",
        age: "-10 days",
      },
    ];

    for (const c of comments) {
      insertComment.run(nanoid(), c.taskId, c.authorId, c.text, c.age);
    }
  });

  seed();
  console.log("Database seeded successfully.");
}
