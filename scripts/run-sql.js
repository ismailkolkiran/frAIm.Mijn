const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function run() {
  const fileArg = process.argv[2];

  if (!fileArg) {
    throw new Error("Gebruik: node scripts/run-sql.js <bestand.sql>");
  }

  const sqlPath = path.resolve(process.cwd(), fileArg);
  const sql = fs.readFileSync(sqlPath, "utf8");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query(sql);
    console.log(`SQL uitgevoerd: ${fileArg}`);
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
