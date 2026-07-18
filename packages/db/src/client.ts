import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let _db: DbInstance | null = null;
let _dbRead: DbInstance | null = null;

function makeDb(url: string): DbInstance {
  const client = postgres(url, { max: 10 });
  return drizzle(client, { schema });
}

/** Primary writer (and default reader). */
export function getDb(connectionString?: string): DbInstance {
  if (_db) return _db;
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  _db = makeDb(url);
  return _db;
}

/**
 * Read replica when DATABASE_READ_URL is set; otherwise same as primary.
 * Use for catalog/search/geo list — never for writes or bookings.
 */
export function getDbRead(): DbInstance {
  if (_dbRead) return _dbRead;
  const readUrl = process.env.DATABASE_READ_URL;
  if (readUrl) {
    _dbRead = makeDb(readUrl);
    return _dbRead;
  }
  return getDb();
}

function proxy(getter: () => DbInstance) {
  return new Proxy({} as DbInstance, {
    get(_target, prop, receiver) {
      const instance = getter();
      const value = Reflect.get(instance as object, prop, receiver);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}

/** Lazy singleton primary. */
export const db = proxy(getDb);

/** Lazy singleton read path (replica or primary). */
export const dbRead = proxy(getDbRead);

export type Db = DbInstance;

export function usingReadReplica(): boolean {
  return Boolean(process.env.DATABASE_READ_URL);
}
