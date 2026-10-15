import { neon } from "@neondatabase/serverless";

export type QueryExecutor = ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>) &
  ((queryString: string, params?: unknown[]) => Promise<unknown>);

let customClient: QueryExecutor | null = null;

export function setDbClient(client: QueryExecutor | null): void {
  customClient = client;
}

export function getDb(): QueryExecutor {
  if (customClient) {
    return customClient;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Please provide a Neon Postgres connection string."
    );
  }

  return neon(databaseUrl) as unknown as QueryExecutor;
}

// Tagged template and string query executor
export const sql: QueryExecutor = ((
  stringsOrQuery: TemplateStringsArray | string,
  ...values: unknown[]
) => {
  const db = getDb();
  if (typeof stringsOrQuery === "string") {
    return (db as (query: string, params?: unknown[]) => Promise<unknown>)(
      stringsOrQuery,
      values[0] as unknown[]
    );
  }
  return (db as (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>)(
    stringsOrQuery,
    ...values
  );
}) as QueryExecutor;

export default sql;
