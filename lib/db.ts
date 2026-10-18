import dns from "node:dns";
import { neon } from "@neondatabase/serverless";

dns.setDefaultResultOrder?.("ipv4first");

export const sql = neon(process.env.DATABASE_URL!);
export default sql;
