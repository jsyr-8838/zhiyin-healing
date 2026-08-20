/**
 * Database access layer — now uses D1 native SQL via @/lib/db.
 *
 * This file is kept for backward compatibility during migration.
 * All imports of { prisma } from '@/lib/prisma' should be replaced
 * with { db } from '@/lib/db'.
 *
 * @deprecated Use @/lib/db instead.
 */
export { db } from './db';
