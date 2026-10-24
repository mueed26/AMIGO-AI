import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

// next build loads this file with no secrets (e.g. inside Docker). neon() checks the URL format but doesn't connect
// until the first query, so a well-formed placeholder lets the build pass. The real DATABASE_URL is used at run time.
const databaseUrl = process.env.DATABASE_URL || 'postgresql://build:build@localhost:5432/build';

const sql = neon(databaseUrl);
export const db = drizzle({ client: sql, schema });
export * from '@/db/schema';
