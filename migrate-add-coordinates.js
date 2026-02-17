#!/usr/bin/env node

/**
 * Migration script to add latitude/longitude columns and shop_settings table
 * Run with: node migrate-add-coordinates.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    let conn = null;
    try {
        console.log('🔄 Connecting to database...');
        conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'schedora'
        });

        console.log('✓ Connected');

        // Step 1: Add latitude column
        console.log('📍 Adding latitude column...');
        try {
            await conn.query('ALTER TABLE shops ADD COLUMN latitude DECIMAL(10,8)');
            console.log('✓ Latitude column added');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ Latitude column already exists');
            } else {
                throw err;
            }
        }

        // Step 2: Add longitude column
        console.log('📍 Adding longitude column...');
        try {
            await conn.query('ALTER TABLE shops ADD COLUMN longitude DECIMAL(11,8)');
            console.log('✓ Longitude column added');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ Longitude column already exists');
            } else {
                throw err;
            }
        }

        // Step 3: Add updated_at column
        console.log('⏰ Adding updated_at column...');
        try {
            await conn.query('ALTER TABLE shops ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
            console.log('✓ Updated_at column added');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ Updated_at column already exists');
            } else {
                throw err;
            }
        }

        // Step 4: Create shop_settings table
        console.log('⚙️  Creating shop_settings table...');
        try {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS shop_settings (
                    id          INT AUTO_INCREMENT PRIMARY KEY,
                    shop_id     INT          NOT NULL UNIQUE,
                    location_mode ENUM('manual','auto') NOT NULL DEFAULT 'manual',
                    map_visible TINYINT(1)   NOT NULL DEFAULT 1,
                    show_distance TINYINT(1) NOT NULL DEFAULT 1,
                    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
                )
            `);
            console.log('✓ shop_settings table created');
        } catch (err) {
            if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log('✓ shop_settings table already exists');
            } else {
                throw err;
            }
        }

        // Step 5: Insert default settings for existing shops
        console.log('📝 Creating default settings for existing shops...');
        try {
            await conn.query(`
                INSERT IGNORE INTO shop_settings (shop_id, location_mode, map_visible, show_distance)
                SELECT id, 'manual', 1, 1 FROM shops
            `);
            console.log('✓ Default settings created');
        } catch (err) {
            console.log('✓ Default settings already exist or error (continuing):', err.message);
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Restart server: npm start');
        console.log('2. Go to Shop Setup');
        console.log('3. Click "Select Location on Map"');
        console.log('4. Click on your location');
        console.log('5. Confirm and save');

    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        console.error('\nError details:', err);
        process.exit(1);
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

// Run migration
migrate();
