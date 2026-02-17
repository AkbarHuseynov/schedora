-- Add coordinates columns to shops table (if they don't exist)
ALTER TABLE shops ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add sample coordinates for testing
-- These are example coordinates, adjust based on your actual shop locations
UPDATE shops SET latitude = 40.7580, longitude = -73.9855 WHERE id = 1;
UPDATE shops SET latitude = 40.7614, longitude = -73.9776 WHERE id = 2;
UPDATE shops SET latitude = 40.7489, longitude = -73.9680 WHERE id = 3;
UPDATE shops SET latitude = 40.7505, longitude = -73.9972 WHERE id = 4;
UPDATE shops SET latitude = 40.7549, longitude = -73.9840 WHERE id = 5;
