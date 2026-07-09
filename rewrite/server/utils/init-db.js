require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });
  const db = process.env.DB_NAME || "expenseflow";
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` DEFAULT CHARSET utf8mb4`);
  await conn.query(`USE \`${db}\``);
  const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
  await conn.query(sql);
  console.log(`Schema loaded into ${db}`);
  await conn.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
