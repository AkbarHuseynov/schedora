# Map Feature & Shop Settings Implementation

## Overview
Complete implementation of interactive maps with owner-controlled visibility settings. Clients see shop locations on maps while owners control exactly what information is displayed.

## Database Changes

### 1. Schema Updates (`database/schema.sql`)
- **shops table**:
  - Added `latitude` (DECIMAL(10,8)) - Shop's latitude coordinate
  - Added `longitude` (DECIMAL(11,8)) - Shop's longitude coordinate
  - Added `updated_at` timestamp - Track profile updates

- **shop_settings table (NEW)**:
  - `location_mode` - How location is determined (manual/auto)
  - `map_visible` - Whether to show shop on map (boolean)
  - `show_distance` - Display distance from client (boolean)
  - Foreign key to shops with CASCADE delete

### 2. Migration Script (`database/add-coordinates.sql`)
Comprehensive migration that:
- Adds coordinate columns to existing shops
- Creates shop_settings table
- Inserts default settings for all existing shops
- Populates sample coordinates for testing (NYC area)
- Handles databases in any state (new or existing)

Run after first deployment:
```bash
mysql -u root -p schedora < database/add-coordinates.sql
```

## Application Layer

### Controllers Updates

**`ownerController.js`**
- `getShopSetup`: Fetches both shop AND settings data
- `postShopSetup`: Saves both shop profile and settings
- Uses INSERT...ON DUPLICATE KEY UPDATE for settings
- Handles new shop creation with default settings

**`clientController.js`**
- `getShops`: Joins shop_settings, filters by map_visible
- `getShopDetail`: Fetches settings and passes to template
- Shop detail respects map_visible and show_distance settings
- All queries optimized to minimize DB hits

### Views Updates

**`views/owner/shop-setup.ejs`**
Comprehensive settings section includes:
- Location Coordinates (manual entry)
  - Latitude and Longitude inputs with guide
  - Help text on getting coordinates from Google Maps
- Location Detection Mode
  - Manual: Owner provides exact coordinates
  - Auto: Future support for browser geolocation
- Map Visibility Checkbox
  - Controls whether shop appears on map
- Distance Display Checkbox
  - Shows approximate distance from client when enabled
  - Only works if shop has coordinates

**`views/client/shop-detail.ejs`**
Enhanced map display:
- Only shows map if `map_visible = true` and coords exist
- Optional distance calculation using Leaflet geolocation
- Requests browser location permission (user decides)
- Shows "X km away" when enabled
- Gracefully hides if owner disabled visibility

**`views/client/shops.ejs`**
Updated map listing:
- Filters shops by `map_visible` setting
- Only shows shops that owner has enabled for map view
- Respects owner's privacy/visibility preferences

## Features

✅ **Owner Controls**
- Set exact shop coordinates
- Toggle map visibility on/off
- Control distance display to clients
- Choose location determination method

✅ **Client Experience**
- See shops on interactive map
- Toggle list/map view
- Click markers for quick shop info
- Optional distance calculation
- Smooth zoom and pan

✅ **Privacy & Flexibility**
- Shops can hide location completely
- Distance display is optional
- No forced data collection
- Owner has full control

✅ **Technical**
- Leaflet.js (open-source, no API keys)
- OpenStreetMap (free tile layer)
- Responsive design (mobile & desktop)
- Browser geolocation (permission-based)
- Efficient database queries

## Setup Instructions

### Initial Setup
1. Ensure database has schema updates:
```bash
mysql -u root -p schedora < database/add-coordinates.sql
```

2. Start server (auto-creates new tables):
```bash
npm start
```

### As Shop Owner
1. Log in and go to "Shop Setup"
2. Scroll to "Location & Map Settings"
3. Enter coordinates from Google Maps:
   - Open Google Maps
   - Right-click on shop location
   - Copy coordinates (format: 40.7128, -74.0060)
4. Choose location mode (currently only manual supported)
5. Check "Show map to clients" to enable map display
6. Check "Show distance" to enable distance calculation
7. Save Changes

### As Client
1. Go to "Browse Shops"
2. Click map icon to toggle between list and map views
3. See all shops with enabled maps
4. Click markers to see shop details
5. View shop detail page for full map and info

## Technical Details

### Database Schema
```sql
-- Coordinates in shops table
latitude DECIMAL(10,8)      -- Range: -90 to +90
longitude DECIMAL(11,8)     -- Range: -180 to +180

-- Settings table for configuration
shop_settings (
  location_mode: enum('manual','auto'),
  map_visible: boolean,
  show_distance: boolean
)
```

### JavaScript Implementation
- Leaflet.js 1.9.4 (CDN)
- OpenStreetMap tile layer (free)
- Geolocation API (optional, user permission)
- Circle markers with gold styling (#C9A96E)
- Automatic map resize on toggle

### Performance
- Shop_settings table uses shop_id as unique key
- Efficient LEFT JOINs in queries
- Minimal JavaScript (only loaded when needed)
- No external API calls required
- CDN-based libraries

## Coordinate Format

Use decimal degrees (standard GPS format):
- **Latitude**: -90 (South Pole) to +90 (North Pole)
- **Longitude**: -180 (West) to +180 (East)

Examples:
- New York: 40.7128, -74.0060
- London: 51.5074, -0.1278
- Tokyo: 35.6762, 139.6503
- Sydney: -33.8688, 151.2093

## Future Enhancements

- Auto-complete address to coordinates (Google Places API)
- Store multiple locations per shop
- Operating hours overlay
- Street view integration
- Route planning to shop
- Clustering for multiple locations
- Heatmap of popular areas
- Check-in/visit history
- Owner location analytics
