// Apply db/schema.sql to the database in DATABASE_URL.
// Locally:  vercel env pull .env.local  then  npm run db:migrate
import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
}
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL not set. Run: vercel env pull .env.local");
  process.exit(1);
}
const sql = neon(url);
const statements = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);
for (const s of statements) {
  await sql.query(s);
  console.log("ok:", s.split("\n")[0].slice(0, 70));
}
const [{ n }] = await sql.query("SELECT count(*)::int AS n FROM leads");
console.log(`leads table ready (${n} rows)`);
