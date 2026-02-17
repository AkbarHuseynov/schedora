# Map Feature with Owner Settings - Complete Setup Guide

## Overview
The map feature is now fully integrated with **owner-controlled visibility settings**. Shop owners decide:
- Whether their location appears on maps
- Whether to show distance from clients
- How their location is determined

## Quick Start (< 5 minutes)

### Step 1: Update Database Schema
```bash
mysql -u root -p schedora < database/add-coordinates.sql
```

This single command:
✅ Adds latitude/longitude columns to shops
✅ Creates shop_settings table
✅ Sets up defaults for all existing shops
✅ Adds sample coordinates for testing

### Step 2: Start Server
```bash
npm start
```

Server automatically creates any missing tables (schema.sql is run on startup).

### Step 3: Test the Feature

**As Shop Owner:**
1. Log in to your owner account
2. Click "Shop Setup"
3. Scroll to **"Location & Map Settings"** section
4. Enter shop coordinates (or update existing)
5. Configure settings:
   - ☑️ Show map to clients (enables location visibility)
   - ☑️ Show distance from client (allows distance calculation)
6. Click "Save Changes"

**As Client:**
1. Log in as client
2. Go to "Browse Shops"
3. Click the **map icon** button (top right)
4. See all enabled shops on the interactive map
5. Click any marker to view shop details
6. Visit shop detail page to see full location map

## Getting Shop Coordinates

### From Google Maps
1. Open https://maps.google.com
2. Search for your shop address
3. **Right-click** on the red location marker
4. Click the coordinates (appears at top)
5. This copies: `40.7128, -74.0060` (example format)
6. Paste into Latitude/Longitude fields

### Coordinate Format
- **Latitude**: -90 (South) to +90 (North) - decimal degrees
- **Longitude**: -180 (West) to +180 (East) - decimal degrees

### Examples
```
New York City:      40.7128, -74.0060
London:             51.5074, -0.1278
Tokyo:              35.6762, 139.6503
Sydney:             -33.8688, 151.2093
São Paulo:          -23.5505, -46.6333
```

## Settings Explained

### Location & Map Settings Section

#### Latitude & Longitude
- **What**: Exact GPS coordinates of your shop
- **Why**: Positions your shop on the map
- **How**: Copy from Google Maps (see above)
- **Required**: Yes, if you want map to show

#### Location Detection Mode
- **Manual (default)**: You provide exact coordinates above
- **Auto**: Future feature for browser-based detection
- **Current**: Only manual is active

#### ☑️ Show map to clients
- **ON**: Your location appears on shop listing map + detail page
- **OFF**: Map is hidden from clients entirely
- **Default**: Enabled
- **Privacy**: You control what clients see

#### ☑️ Show distance from client
- **ON**: Displays "X km away" if client allows location access
- **OFF**: No distance information shown
- **Default**: Enabled
- **Permission**: Requires client to allow location sharing

## Shop Listing Map View

### Features
- **Toggle View**: Click map icon to switch between list and map
- **Visible Shops**: Only shops with "Show map" enabled appear
- **Markers**: Golden circles show shop locations
- **Click Info**: Click marker to see shop name, address, and link
- **Full View**: Click "View Shop" to go to detail page

### What Clients See
```
Map shows:
├─ All shops with map_visible = ON
├─ Golden markers at shop coordinates
├─ Shop name & address in popup
└─ Link to full shop page
```

## Shop Detail Map

### Features
- **Full-Size Map**: 400px height, interactive
- **Location Marker**: Red marker at exact coordinates
- **Address Display**: Shop name and address in popup
- **Distance Info** (if enabled):
  - Browser asks for location permission
  - Shows "X km away" if granted
  - Shows helpful message if disabled

### What Controls Display
```
Map appears when:
├─ Shop has coordinates (latitude + longitude)
├─ map_visible = ON
└─ Settings are saved

Optional distance shows when:
├─ show_distance = ON
├─ Client allows browser location access
└─ Leaflet calculates the distance
```

## Migration & Database

### Schema Changes
New table: `shop_settings`
```sql
CREATE TABLE shop_settings (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    shop_id         INT NOT NULL UNIQUE,
    location_mode   ENUM('manual','auto') DEFAULT 'manual',
    map_visible     TINYINT(1) DEFAULT 1,
    show_distance   TINYINT(1) DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Existing shops: Defaults auto-created
- All existing shops get default settings
- Map visible by default
- Distance display enabled by default
- You can change anytime

### Sample Data
First 5 shops get NYC area coordinates:
```
Shop 1: 40.7580, -73.9855
Shop 2: 40.7614, -73.9776
Shop 3: 40.7489, -73.9680
Shop 4: 40.7505, -73.9972
Shop 5: 40.7549, -73.9840
```
Update these with your actual shop locations.

## Troubleshooting

### Map Not Showing?
**Check:**
1. ✓ Shop has coordinates (lat/lng fields filled)
2. ✓ "Show map to clients" is checked
3. ✓ Settings are saved (no errors in form)
4. ✓ Coordinates are valid numbers

**Fix:**
- Go to Shop Setup
- Enter coordinates from Google Maps
- Check "Show map to clients"
- Click Save

### Distance Not Showing?
**Check:**
1. ✓ "Show distance" checkbox is enabled
2. ✓ Client allows browser location access
3. ✓ Browser geolocation is not blocked

**Fix:**
- Enable "Show distance" checkbox in Shop Setup
- Client can grant location in browser permission

### Settings Not Saving?
**Check:**
1. ✓ No form validation errors showing
2. ✓ Database is running
3. ✓ Browser console has no errors

**Fix:**
- Check server logs for SQL errors
- Ensure coordinates are in valid range
- Try clearing form and re-entering data

### Coordinates Invalid?
**Valid ranges:**
- Latitude: -90 to +90
- Longitude: -180 to +180

**Common error:**
- Using incorrect separator (comma, not space)
- Correct: `40.7128,-74.0060`
- Wrong: `40.7128 -74.0060`

## Files Modified

| File | Purpose |
|------|---------|
| `database/schema.sql` | Added coordinates + updated_at |
| `database/add-coordinates.sql` | Migration: settings table + samples |
| `controllers/ownerController.js` | Handle settings in setup |
| `controllers/clientController.js` | Fetch settings for display |
| `views/owner/shop-setup.ejs` | Settings UI for owners |
| `views/client/shop-detail.ejs` | Show map with settings |
| `views/client/shops.ejs` | Filter by map_visible |

## For Developers

### Database Queries
```javascript
// Get shop with settings
SELECT s.*, ss.map_visible, ss.show_distance
FROM shops s
LEFT JOIN shop_settings ss ON ss.shop_id = s.id
WHERE s.id = ?

// Filter shops by visibility
WHERE s.is_active = 1 AND (ss.map_visible IS NULL OR ss.map_visible = 1)

// Save settings
INSERT INTO shop_settings (shop_id, map_visible, show_distance, location_mode)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  map_visible = VALUES(map_visible),
  show_distance = VALUES(show_distance),
  location_mode = VALUES(location_mode)
```

### Frontend Implementation
- Leaflet.js 1.9.4 (CDN)
- OpenStreetMap tiles (free)
- Geolocation API (browser built-in)
- No API keys or external dependencies

## Next Steps (Future)

- [ ] Geocoding API to auto-populate coordinates from address
- [ ] Multiple locations per shop
- [ ] Operating hours overlay
- [ ] Street view integration
- [ ] Route directions
- [ ] Heatmap of popular areas
- [ ] Check-in tracking
- [ ] Analytics dashboard

## Support

Check `.claude/MAP_FEATURE.md` for technical details and architecture.
