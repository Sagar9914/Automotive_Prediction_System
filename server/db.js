// server/db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",      // change if needed
  host: "localhost",
  database: "auto_agentic_db",
  password: "123456", // change
  port: 5432,
});

module.exports = pool;
