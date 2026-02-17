-- Migration: Add Map Feature Support
-- This script adds coordinates and settings tables for the map feature

-- Step 1: Add coordinates columns to shops table (if they don't exist)
ALTER TABLE shops ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Step 2: Add updated_at column if missing
ALTER TABLE shops ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Step 3: Create shop_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS shop_settings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    shop_id     INT          NOT NULL UNIQUE,
    location_mode ENUM('manual','auto') NOT NULL DEFAULT 'manual',
    map_visible TINYINT(1)   NOT NULL DEFAULT 1,
    show_distance TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- Step 4: Insert default settings for existing shops
INSERT IGNORE INTO shop_settings (shop_id, location_mode, map_visible, show_distance)
SELECT id, 'manual', 1, 1 FROM shops;

-- Step 5: Add sample coordinates for testing (NYC area)
-- You can update these with real shop coordinates
UPDATE shops SET latitude = 40.7580, longitude = -73.9855 WHERE id = 1 AND latitude IS NULL;
UPDATE shops SET latitude = 40.7614, longitude = -73.9776 WHERE id = 2 AND latitude IS NULL;
UPDATE shops SET latitude = 40.7489, longitude = -73.9680 WHERE id = 3 AND latitude IS NULL;
UPDATE shops SET latitude = 40.7505, longitude = -73.9972 WHERE id = 4 AND latitude IS NULL;
UPDATE shops SET latitude = 40.7549, longitude = -73.9840 WHERE id = 5 AND latitude IS NULL;
