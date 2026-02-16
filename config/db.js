const mysql  = require('mysql2/promise');
const fs     = require('fs');
const path   = require('path');
require('dotenv').config();

// ── Connection pool (used by all controllers) ────────────────────────────────
const pool = mysql.createPool({
    host:               process.env.DB_HOST     || 'localhost',
    port:               process.env.DB_PORT     || 3306,
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'schedora',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    multipleStatements: true   // required to run the full schema.sql in one call
});

// ── Auto-initialise: run schema.sql on every server start ───────────────────
// All statements use IF NOT EXISTS so it is safe to run on every startup.
async function initDB() {
    try {
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema     = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('  \u2714 Database ready (schedora)');
    } catch (err) {
        console.error('  \u2718 Database init failed:', err.message);
        process.exit(1);
    }
}

// Export pool as default so controllers work unchanged:
//   const db = require('../config/db')  →  still returns the pool
// Also attach initDB for server.js to call at startup.
module.exports        = pool;
module.exports.initDB = initDB;
