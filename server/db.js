import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pgliteClient = null;
let pgPool = null;

// Determine if using Cloud Postgres (DATABASE_URL) or embedded persistent Postgres (PGlite)
const DATABASE_URL = process.env.DATABASE_URL;

export async function initDatabase() {
  if (DATABASE_URL) {
    console.log('[PostgreSQL] Connecting to Cloud PostgreSQL via DATABASE_URL...');
    // family: 4 forces IPv4 — avoids ENETUNREACH when DNS returns an
    // unreachable IPv6 address (common on Render/Supabase).
    pgPool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      family: 4,
    });
  } else {
    const dataDir = path.join(__dirname, 'postgres_data');
    console.log(`[PostgreSQL] Initializing persistent Postgres database at: ${dataDir}`);
    pgliteClient = new PGlite(dataDir);
  }

  // Run schema migration
  const schemaPath = path.join(__dirname, 'schema.sql');
  const seedPath = path.join(__dirname, 'seed.sql');

  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await executeQuery(schemaSql);
    console.log('[PostgreSQL] Schema tables verified and ready.');
  }

  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await executeQuery(seedSql);
    console.log('[PostgreSQL] Seed data loaded successfully.');
  }

  return true;
}

export async function query(sql, params = []) {
  if (pgPool) {
    const res = await pgPool.query(sql, params);
    return res;
  } else if (pgliteClient) {
    const res = await pgliteClient.query(sql, params);
    return res;
  } else {
    throw new Error('Database not initialized');
  }
}

async function executeQuery(rawSql) {
  if (pgPool) {
    return await pgPool.query(rawSql);
  } else if (pgliteClient) {
    return await pgliteClient.exec(rawSql);
  }
}
