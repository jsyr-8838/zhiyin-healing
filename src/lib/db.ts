/**
 * Lightweight D1 database wrapper — replaces Prisma ORM for Cloudflare Workers deployment.
 *
 * Provides a simple, typed SQL query interface using Cloudflare D1's native API.
 * This removes the ~4MB Prisma WASM engine from the Worker bundle.
 *
 * Usage:
 *   import { db } from '@/lib/db';
 *   const user = await db.findOne<UserRow>('SELECT * FROM User WHERE id = ?', [userId]);
 *   const users = await db.findAll<UserRow>('SELECT * FROM User WHERE role = ?', ['registered']);
 *   const result = await db.execute('INSERT INTO User (id, phone) VALUES (?, ?)', [id, phone]);
 */

/** Generate a CUID-like ID (timestamp + random) */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${random}`;
}

/** Get current ISO timestamp */
export function now(): string {
  return new Date().toISOString();
}

interface D1Result {
  results?: Record<string, unknown>[];
  success: boolean;
  meta?: {
    changes?: number;
    last_row_id?: number;
    [key: string]: unknown;
  };
}

interface D1Stmt {
  bind(...values: unknown[]): D1Stmt;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }>;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(sql: string): D1Stmt;
  exec(sql: string): Promise<unknown>;
}

interface CloudflareEnv {
  DB: D1Database;
  [key: string]: unknown;
}

/**
 * Get the D1 database instance.
 * In production (Cloudflare Workers): uses getCloudflareContext().env.DB
 * In development: falls back to local D1 via getCloudflareContext() (set up by initOpenNextCloudflareForDev)
 */
function getDB(): D1Database {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getCloudflareContext } = require('@opennextjs/cloudflare');
  const ctx = getCloudflareContext();
  return (ctx.env as CloudflareEnv).DB;
}

/** Database helper — provides SQL execution methods */
export const db = {
  /** Execute a query and return the first row, or null */
  async findOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
    const database = getDB();
    return database.prepare(sql).bind(...params).first<T>();
  },

  /** Execute a query and return all matching rows */
  async findAll<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const database = getDB();
    const result = await database.prepare(sql).bind(...params).all<T>();
    return result.results || [];
  },

  /** Execute an INSERT/UPDATE/DELETE and return metadata */
  async execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastInsertRowid: number | null }> {
    const database = getDB();
    const result = await database.prepare(sql).bind(...params).run();
    return {
      changes: result.meta?.changes ?? 0,
      lastInsertRowid: result.meta?.last_row_id ?? null,
    };
  },

  /** Execute multiple SQL statements (no parameter binding) */
  async exec(sql: string): Promise<void> {
    const database = getDB();
    await database.exec(sql);
  },

  /** Generate a new ID */
  generateId,

  /** Get current timestamp */
  now,
};
