// Run once: node fix-admin.js
// Resets the admin password to Admin@1234

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

async function fixAdmin() {
    const hash = await bcrypt.hash('Admin@1234', 10);
    console.log('Generated hash:', hash);

    const conn = await mysql.createConnection({
        host:     process.env.DB_HOST     || 'localhost',
        port:     process.env.DB_PORT     || 3306,
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'schedora'
    });

    // Delete and re-insert to guarantee clean state
    await conn.query('DELETE FROM users WHERE email = ?', ['admin@schedora.com']);
    await conn.query(
        'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
        ['Admin', 'admin@schedora.com', hash, 'admin', 1]
    );

    console.log('✔ Admin account reset successfully!');
    console.log('  Email:    admin@schedora.com');
    console.log('  Password: Admin@1234');

    await conn.end();
}

fixAdmin().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
