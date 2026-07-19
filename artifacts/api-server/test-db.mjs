import { neon } from "@neondatabase/serverless";

const dbUrl = "postgresql://neondb_owner:npg_WQKd9plZJD0z@ep-blue-cherry-ai05ptbu.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function test() {
  try {
    console.log("Connecting to database...");
    const sql = neon(dbUrl);
    const result = await sql`SELECT 1 as count`;
    console.log("DB Test Success:", result);
  } catch (err) {
    console.error("DB Test Failed:", err);
  }
}

test();
