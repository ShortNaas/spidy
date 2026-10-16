import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

describe("Database Schema & Specifications", () => {
  it("db/schema.sql defines sites, events, and daily_stats with exact required columns", async () => {
    const schemaPath = path.resolve(process.cwd(), "db/schema.sql");
    const schemaSql = await readFile(schemaPath, "utf-8");

    // Must define required tables
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS sites");
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS events");
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS daily_stats");

    // Events table columns
    expect(schemaSql).toMatch(/\bts\b/);
    expect(schemaSql).toMatch(/\bsite_id\b/);
    expect(schemaSql).toMatch(/\bpath\b/);
    expect(schemaSql).toMatch(/\breferrer\b/);
    expect(schemaSql).toMatch(/\bcountry\b/);
    expect(schemaSql).toMatch(/\bcity\b/);
    expect(schemaSql).toMatch(/\blat\b/);
    expect(schemaSql).toMatch(/\blon\b/);
    expect(schemaSql).toMatch(/\bdevice\b/);
    expect(schemaSql).toMatch(/\bbrowser\b/);
    expect(schemaSql).toMatch(/\bos\b/);
    expect(schemaSql).toMatch(/\bvisitor\b/);
    expect(schemaSql).toMatch(/\bsession\b/);

    // Hard Constraint 2: Raw IP is NEVER stored or logged
    expect(schemaSql.toLowerCase()).not.toContain("raw_ip");
    expect(schemaSql.toLowerCase()).not.toContain("ip_address");
    expect(schemaSql.toLowerCase()).not.toMatch(/\bip\b\s+text/);

    // Daily stats primary key constraint
    expect(schemaSql).toContain("PRIMARY KEY (day, site_id, path, referrer, country, device)");
  });

  it("db/migrations/0001_initial.sql defines base analytics tables", async () => {
    const migrationSql = await readFile(
      path.resolve(process.cwd(), "db/migrations/0001_initial.sql"),
      "utf-8"
    );
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS sites");
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS events");
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS daily_stats");
  });

  it("db/migrations/0002_accounts.sql defines accounts, sessions, and rate-limiting tables", async () => {
    const migrationSql = await readFile(
      path.resolve(process.cwd(), "db/migrations/0002_accounts.sql"),
      "utf-8"
    );
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS users");
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS sessions");
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS auth_attempts");
    expect(migrationSql).toContain("ALTER TABLE sites ADD COLUMN IF NOT EXISTS user_id");
  });
});

