import dns from "node:dns";
import { neon } from "@neondatabase/serverless";

dns.setDefaultResultOrder?.("ipv4first");

export type QueryExecutor = ((
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<unknown>) &
  ((queryString: string, params?: unknown[]) => Promise<unknown>);

let customClient: QueryExecutor | null = null;
export const setDbClient = (client: QueryExecutor | null): void => {
  customClient = client;
};

export const sql: QueryExecutor = ((
  stringsOrQuery: TemplateStringsArray | string,
  ...values: unknown[]
) => {
  const db = customClient || neon(process.env.DATABASE_URL!);
  if (typeof stringsOrQuery === "string") {
    return "query" in db &&
      typeof (db as { query?: (q: string, p?: unknown[]) => Promise<unknown> }).query === "function"
      ? (db as { query: (q: string, p?: unknown[]) => Promise<unknown> }).query(
          stringsOrQuery,
          values[0] as unknown[]
        )
      : (db as (q: string, p?: unknown[]) => Promise<unknown>)(
          stringsOrQuery,
          values[0] as unknown[]
        );
  }
  return (db as (s: TemplateStringsArray, ...v: unknown[]) => Promise<unknown>)(
    stringsOrQuery,
    ...values
  );
}) as QueryExecutor;

export default sql;
