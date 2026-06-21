import { drizzle } from 'drizzle-orm/postgres-js';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/env';

const client = postgres(env.POSTGRES_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
});
export const db = drizzle(client, { schema });

/** Database client type — either the root `db` or a transaction handle. */
export type DbClient = typeof db | PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
