import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "../../kanban.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export default db;
