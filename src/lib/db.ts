/**
 * D1 database wrapper — uses Cloudflare D1 REST API.
 *
 * Works in any environment (Vercel, Cloudflare, local dev) because it
 * calls D1 via HTTPS REST API instead of relying on a Worker binding.
 *
 * Required env vars:
 *   D1_DATABASE_ID  — Cloudflare D1 database ID
 *   CLOUDFLARE_ACCOUNT_ID — Cloudflare account ID
 *   CLOUDFLARE_API_TOKEN  — Cloudflare API token with D1 edit permission
 *
 * Usage:
 *   import { db } from '@/lib/db';
 *   const user = await db.findOne<UserRow>('SELECT * FROM User WHERE id = ?', [userId]);
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

interface D1Response {
  result?: Array<{
    results?: Record<string, unknown>[];
    success: boolean;
    meta?: {
      changes?: number;
      last_row_id?: number;
      [key: string]: unknown;
    };
  }>;
  errors?: Array<{ message: string }>;
  success?: boolean;
}

/** Cache token for mock-local mode */
let _mockMode = false;

/**
 * Call D1 REST API to execute SQL.
 */
async function callD1(sql: string, params: unknown[] = []): Promise<D1Response> {
  // If no credentials, use mock mode (returns empty results)
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !dbId || !apiToken) {
    _mockMode = true;
    // Return empty result set — useful during build time when no DB is available
    return {
      result: [{
        results: [],
        success: true,
        meta: { changes: 0, last_row_id: 0 },
      }],
    };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;

  const body = JSON.stringify({ sql, params });
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`D1 API error ${resp.status}: ${text}`);
  }

  return (await resp.json()) as D1Response;
}

/** Database helper — provides SQL execution methods via D1 REST API */
export const db = {
  /** Execute a query and return the first row, or null */
  async findOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
    const data = await callD1(sql, params);
    const rows = data.result?.[0]?.results ?? [];
    return (rows[0] as T) ?? null;
  },

  /** Execute a query and return all matching rows */
  async findAll<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const data = await callD1(sql, params);
    const rows = data.result?.[0]?.results ?? [];
    return rows as T[];
  },

  /** Execute an INSERT/UPDATE/DELETE and return metadata */
  async execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastInsertRowid: number | null }> {
    const data = await callD1(sql, params);
    const meta = data.result?.[0]?.meta;
    return {
      changes: meta?.changes ?? 0,
      lastInsertRowid: meta?.last_row_id ?? null,
    };
  },

  /** Execute multiple SQL statements (no parameter binding) */
  async exec(sql: string): Promise<void> {
    // D1 REST API supports multiple statements via /exec endpoint
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const dbId = process.env.D1_DATABASE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !dbId || !apiToken) {
      return; // mock mode — no-op
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/exec`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`D1 exec error ${resp.status}: ${text}`);
    }
  },

  /** Generate a new ID */
  generateId,

  /** Get current timestamp */
  now,
};
