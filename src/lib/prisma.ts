import { PrismaClient } from '@prisma/client';

/**
 * Prisma client for Cloudflare Workers (D1) and local dev (SQLite file).
 *
 * In production (Cloudflare Workers):
 *   - Uses @prisma/adapter-d1 to connect to Cloudflare D1
 *   - Uses getCloudflareContext() to access the D1 binding
 *
 * In development (next dev):
 *   - Uses standard PrismaClient with SQLite file (prisma/dev.db)
 *   - Cached on globalThis to survive HMR
 */

let prismaClient: PrismaClient | null = null;

function createClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    // Production: use D1 adapter
    // Dynamic require to avoid breaking local dev where @opennextjs/cloudflare is optional
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const { PrismaD1 } = require('@prisma/adapter-d1');
    const { env } = getCloudflareContext();
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter });
  }

  // Development: use local SQLite file
  if (!prismaClient) {
    prismaClient = new PrismaClient();
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaClient;
    }
  }
  return prismaClient;
}

/**
 * Prisma client instance.
 * - Production: backed by Cloudflare D1 via @prisma/adapter-d1
 * - Development: backed by local SQLite file via prisma/dev.db
 *
 * Uses a Proxy to lazily create the client on first access,
 * avoiding "getCloudflareContext is not available" during dev.
 */
export const prisma: PrismaClient = new Proxy(
  {},
  {
    get(_target, prop: string) {
      const client = createClient();
      const value = (client as Record<string, unknown>)[prop];
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value;
    },
  }
) as PrismaClient;
