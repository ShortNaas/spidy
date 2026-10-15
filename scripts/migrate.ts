import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Error: DATABASE_URL is not set.");
    console.error("Please set DATABASE_URL in your environment or in .env / .env.local file.");
    process.exit(1);
  }
  return url;
}

export async function runMigrations(): Promise<void> {
  const url = getDatabaseUrl();
  const sql = neon(url);

  console.log("Connecting to database for migrations...");

  // Create migrations tracker table
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id serial PRIMARY KEY,
      name text UNIQUE NOT NULL,
      applied_at timestamptz DEFAULT now()
    );
  `;

  const appliedRows = (await sql`
    SELECT name FROM _migrations ORDER BY id ASC;
  `) as Array<{ name: string }>;

  const appliedSet = new Set(appliedRows.map((r) => r.name));
  const migrationsDir = path.resolve(process.cwd(), "db/migrations");
  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();

  let newlyApplied = 0;

  for (const file of files) {
    if (appliedSet.has(file)) {
      continue;
    }

    console.log(`Applying migration: ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sqlContent = await readFile(filePath, "utf-8");

    // Execute statements
    // Split by semicolons while ignoring commented lines
    const statements = sqlContent
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
      if (stmt.length > 0) {
        // Tagged template neon function can also be called directly with string or unsafe
        // For DDL execution, calling the sql function directly:
        await (sql as unknown as (s: string) => Promise<unknown>)(stmt);
      }
    }

    await sql`
      INSERT INTO _migrations (name) VALUES (${file});
    `;
    console.log(`✓ Applied ${file}`);
    newlyApplied++;
  }

  if (newlyApplied === 0) {
    console.log("Database schema is already up to date.");
  } else {
    console.log(`Successfully applied ${newlyApplied} migration(s).`);
  }
}

// Run if called directly
if (process.argv[1]?.endsWith("migrate.ts")) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
