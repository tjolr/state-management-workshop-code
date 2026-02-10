# Project overview

Kanban board app — pnpm monorepo with a React client and an Express/Drizzle server.

## Structure

```
client/                → React + Vite + Redux Toolkit
server/                → Express + Drizzle ORM + SQLite
```

## Server (`server/src/`)

- `routes/`            — API endpoint handlers (`tasks.ts`, `users.ts`, `comments.ts`)
- `db/schema.ts`       — Drizzle database schema (tables, relations)
- `db/connection.ts`   — DB connection setup
- `db/seed.ts`         — Seed data
- `index.ts`           — Express app entry point

## Client (`client/src/`)

- `types/index.ts`     — Shared domain types (`Task`, `User`, `Comment`, `TagType`, `TaskState`, etc.)
- `types/api.ts`       — API input types (`CreateTaskInput`, `UpdateTaskInput`, etc.)
- `state-management/`  — All Redux/RTK Query state, grouped by domain:
  - `store.ts`         — `configureStore`, `RootState`, `AppDispatch`, typed hooks
  - `index.ts`         — Barrel file; the **only** import path components should use (`@/state-management`)
  - `server-state/api/apiSlice.ts` — RTK Query endpoints + derived selectors
  - `client-state/tasks/`    — `useTasks`, `useTaskStats`
  - `client-state/filters/`  — `filterSlice`, `useFilters`
  - `client-state/sorting/`  — `sortingSlice`, `useSorting`
  - `client-state/theme/`    — `themeSlice`, `useTheme`
- `components/`        — UI split into `board/`, `layout/`, `shared/`, `task/`, `ui/`
- `providers/`         — `ThemeProvider`
- `lib/`               — Utilities

## Commands

```sh
pnpm install           # install all dependencies
pnpm dev               # start both client (Vite) and server concurrently
pnpm --filter client build        # production build (client)
pnpm --filter client tsc --noEmit # type-check client
```

## Path alias

The client uses `@/` as an alias for `client/src/` (configured in `vite.config.ts` and `tsconfig.json`).
