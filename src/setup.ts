import { sql } from "./lib/postgres";

async function setup() {
  await sql/*sql*/ `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY UNIQUE,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql/*sql*/ `
    CREATE TABLE IF NOT EXISTS short_links (
      id TEXT PRIMARY KEY UNIQUE,
      code TEXT UNIQUE,
      original_url TEXT,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql.end();
  console.log("Setup done");
}

setup();
