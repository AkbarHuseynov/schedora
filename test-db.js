#!/usr/bin/env node
/**
 * Quick test to verify database connection and schema
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    try {
        console.log('🔄 Testing database connection...\n');

        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'schedora'
        });

        console.log('✓ Connected to database\n');

        // Test 1: Check shops table structure
        console.log('📋 Checking shops table...');
        const [shops] = await conn.query('DESCRIBE shops');
        const shopCols = shops.map(s => s.Field);
        console.log('Shops table columns:', shopCols.join(', '));

        if (!shopCols.includes('latitude') || !shopCols.includes('longitude')) {
            console.log('⚠️  WARNING: latitude/longitude columns missing!');
        } else {
            console.log('✓ latitude and longitude columns present\n');
        }

        // Test 2: Check shop_settings table
        console.log('📋 Checking shop_settings table...');
        try {
            const [settings] = await conn.query('DESCRIBE shop_settings');
            console.log('✓ shop_settings table exists');
            console.log('Columns:', settings.map(s => s.Field).join(', '));
        } catch (err) {
            console.log('⚠️  shop_settings table missing!');
        }
        console.log();

        // Test 3: Try a sample query
        console.log('🧪 Testing sample query...');
        const [result] = await conn.query('SELECT COUNT(*) as count FROM shops');
        console.log(`✓ Found ${result[0].count} shops\n`);

        // Test 4: Check if coordinates exist
        console.log('📍 Checking for shops with coordinates...');
        const [coordShops] = await conn.query('SELECT id, name, latitude, longitude FROM shops WHERE latitude IS NOT NULL LIMIT 3');
        if (coordShops.length > 0) {
            console.log('✓ Found shops with coordinates:');
            coordShops.forEach(s => {
                console.log(`  - ${s.name}: (${s.latitude}, ${s.longitude})`);
            });
        } else {
            console.log('No shops have coordinates yet (normal - will be set via form)\n');
        }

        console.log('\n✅ Database is ready!\n');
        console.log('You can now:');
        console.log('1. Start server: npm start');
        console.log('2. Go to Shop Setup');
        console.log('3. Click "Select Location on Map"');
        console.log('4. Select location and save');

        await conn.end();

    } catch (err) {
        console.error('\n❌ Error:', err.message);
        console.error('\nDetails:', err);
        process.exit(1);
    }
})();
