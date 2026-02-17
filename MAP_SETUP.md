# Map Feature Setup Guide

## Quick Start

### Step 1: Update Database Schema
Run the migration script to add coordinates columns to existing shops:

```bash
mysql -u root -p schedora < database/add-coordinates.sql
```

This will:
- Add `latitude` and `longitude` columns to shops table
- Populate sample coordinates for test shops (IDs 1-5)

### Step 2: Start Your Server
```bash
npm start
```

### Step 3: Test the Features

#### As a Shop Owner:
1. Log in to your owner account
2. Go to "Shop Setup"
3. Scroll to "Location Coordinates" section
4. Enter your shop's latitude and longitude
5. Click "Save Changes"

**How to get coordinates:**
- Open Google Maps
- Search for your shop address
- Right-click on the location
- Coordinates appear at top
- Click to copy (format: 40.7128, -74.0060)

#### As a Client:
1. Log in to your client account
2. Go to "Browse Shops"
3. Click the **map icon** button next to Search to toggle map view
4. See all shops with coordinates displayed as golden markers
5. Click a marker to see shop details
6. Click "View Shop" link to go to the full shop page

### Shop Detail Map
- Visit any shop's detail page
- If the shop has coordinates set, you'll see an interactive map
- The map shows the exact location with a marker
- Click the marker to see shop name and address

## Coordinates Format

Use decimal degrees format:
- **Latitude**: -90 to +90 (North is positive)
- **Longitude**: -180 to +180 (East is positive)

Example (New York):
- Latitude: 40.7128
- Longitude: -74.0060

Example (London):
- Latitude: 51.5074
- Longitude: -0.1278

Example (Tokyo):
- Latitude: 35.6762
- Longitude: 139.6503

## What Users See

### Shop Listing (Map View)
- Toggle between list and map view
- Golden markers show shop locations
- Click marker to see name, address, and view link
- Zoom and pan to explore the map

### Shop Detail Page
- Full-size interactive map
- Centered on shop location (zoom level 15)
- Marker with shop name and address popup
- Perfect for directions and planning

## Features Included

✅ Interactive Leaflet.js maps
✅ OpenStreetMap tile layer (free, no API key)
✅ Marker popups with shop info
✅ Responsive design (mobile & desktop)
✅ List/Map toggle view
✅ Owner can set/update coordinates
✅ Optional coordinates (shops without coordinates still work)

## Troubleshooting

**Map not showing?**
- Check that shop has latitude and longitude values
- Verify coordinates are valid decimal numbers
- Check browser console for JavaScript errors

**Coordinates not saving?**
- Verify latitude is between -90 and 90
- Verify longitude is between -180 and 180
- Check for SQL errors in server console

**Map not loading?**
- Check internet connection (CDN-based Leaflet.js)
- Check browser console for errors
- Verify OpenStreetMap isn't blocked

## File Changes Summary

| File | Change |
|------|--------|
| `database/schema.sql` | Added latitude/longitude columns |
| `database/add-coordinates.sql` | Migration script with sample data |
| `views/client/shop-detail.ejs` | Added map display |
| `views/client/shops.ejs` | Added map toggle and map view |
| `views/owner/shop-setup.ejs` | Added coordinate input fields |
| `controllers/ownerController.js` | Handle coordinate save |

## Next Steps (Optional Enhancements)

- Add Google Geolocation API integration to auto-populate from address
- Show distance from user's current location
- Add route planning button to Google Maps
- Show store hours on the map
- Cluster markers for multiple locations
- Heatmap showing popular shop areas
