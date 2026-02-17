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
    multipleStatements: true
});

// ── Auto-initialise: create DB + tables if they don't exist ─────────────────
async function initDB() {
    const dbName = process.env.DB_NAME || 'schedora';

    // Step 1: connect WITHOUT specifying a database so we can create it
    const tempConn = await mysql.createConnection({
        host:     process.env.DB_HOST     || 'localhost',
        port:     process.env.DB_PORT     || 3306,
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        // Step 2: create the database if it doesn't exist
        await tempConn.query(
            `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );

        // Step 3: switch to it
        await tempConn.query(`USE \`${dbName}\``);

        // Step 4: read and run the full schema (tables + admin seed)
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema     = fs.readFileSync(schemaPath, 'utf8');
        await tempConn.query(schema);

        console.log(`  \u2714 Database ready (${dbName})`);
    } catch (err) {
        console.error('  \u2718 Database init failed:', err.message);
        process.exit(1);
    } finally {
        await tempConn.end();
    }
}

// Export pool as default so all controllers work unchanged.
// Also expose initDB for server.js.
module.exports        = pool;
module.exports.initDB = initDB;
