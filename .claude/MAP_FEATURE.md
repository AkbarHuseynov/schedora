# Map Feature Implementation

## Overview
Added interactive maps to display shop locations so clients can see where shops are situated.

## Changes Made

### 1. Database Schema (`database/schema.sql`)
- Added `latitude` (DECIMAL(10,8)) column to shops table
- Added `longitude` (DECIMAL(11,8)) column to shops table

### 2. Migration Script (`database/add-coordinates.sql`)
- SQL script to add coordinates to existing shops table
- Includes sample coordinates for shops 1-5 (NYC area)
- Run this after schema update: `mysql -u root -p schedora < database/add-coordinates.sql`

### 3. Shop Detail Page (`views/client/shop-detail.ejs`)
- Added interactive map display showing shop location
- Uses Leaflet.js (open-source, requires no API key)
- Map displays when `latitude` and `longitude` are available
- Shows shop marker with popup containing name and address
- Centered on shop location with zoom level 15

### 4. Shop Listing Page (`views/client/shops.ejs`)
- Added "Map View" toggle button next to search
- Displays all shops with coordinates on interactive map
- Features:
  - Golden circle markers for each shop
  - Click markers to see shop details with link to view shop
  - View toggles between list and map mode
  - Map centers on first shop's location
  - Auto-rescales when toggled to visible

### 5. Shop Setup Form (`views/owner/shop-setup.ejs`)
- Added Latitude and Longitude input fields
- Optional fields for shop owners to enter coordinates
- Help text explaining how to get coordinates from Google Maps
- Fields support decimal precision for accurate locations

### 6. Owner Controller (`controllers/ownerController.js`)
- Updated `postShopSetup` to handle latitude/longitude fields
- Saves coordinates when creating or updating shop profile
- NULL values allowed for shops without coordinates

## Frontend Dependencies
- **Leaflet.js** v1.9.4 - CDN loaded from cdnjs.cloudflare.com
- **OpenStreetMap** - Free tile layer (no API key needed)

## How to Use

### For Shop Owners
1. Go to Shop Setup (Owner Dashboard)
2. Scroll to "Location Coordinates" section
3. Get coordinates from Google Maps:
   - Go to Google Maps
   - Right-click on shop location
   - Click coordinates to copy (latitude, longitude)
4. Paste latitude and longitude in the fields
5. Save Shop Changes

### For Clients
1. **Shop Detail Page**: View interactive map showing exact shop location
2. **Shop Listing Page**:
   - Click map icon to toggle between list and map view
   - See all shops with coordinates as markers
   - Click markers to view shop details
   - Click "View Shop" link in popup to go to shop detail page

## Testing
1. Update database: `mysql -u root -p schedora < database/add-coordinates.sql`
2. Start server: `npm start`
3. As owner: Add/update coordinates in shop setup
4. As client: Browse shops and toggle map view

## Technical Details
- Maps use Leaflet Circle Markers (gold color: #C9A96E)
- Maps automatically resize when toggled between views
- Popups show shop name, address, and quick link
- Responsive design works on mobile and desktop
- No external API keys required

## Future Enhancements
- Geolocation API to show "distance from user"
- Geocoding API to auto-populate coordinates from address
- Multiple location clustering for shops with many locations
- Route planning to shop location
- Working hours overlay on maps
