# 🚀 Quick Reference - Location Map System

## Start Development
```bash
npm start
```
Then: http://localhost:3000

## Test Location Search (30 seconds)

1. **Login** as shop owner
2. Go to **Shop Setup**
3. Click **"Select Location on Map"**
4. Type `"Flame Towers"` in search
5. Click **Search**
6. ✅ Map centers on Flame Towers
7. Click **"Confirm Location"**
8. Check **"Show map to clients"**
9. Click **"Save Changes"**

## Feature Overview

### For Shop Owners
```
Shop Setup → Select Location Modal
├─ Method 1: Click on map to place marker
├─ Method 2: Search location by name
├─ Settings: Show map? Show distance?
└─ Save coordinates to database
```

### For Clients
```
Shop Detail → View on Map button (if enabled)
├─ Interactive map modal opens
├─ See shop location with marker
├─ See address and optional distance
└─ Full map interaction (zoom, pan)
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `views/owner/shop-setup.ejs` | Owner location picker + search |
| `views/client/shop-detail.ejs` | Client map modal |
| `controllers/ownerController.js` | Save locations & settings |
| `controllers/clientController.js` | Fetch locations & settings |
| `database/schema.sql` | Tables: shops, shop_settings |

## Search Implementation

**File**: `views/owner/shop-setup.ejs` (lines 221-290)

**How it works**:
1. User types location name
2. Clicks Search or presses Enter
3. Nominatim API geocodes the name
4. Map centers on result
5. Marker placed at coordinates
6. Badges update with lat/lng

**Example**: "Flame Towers" → (40.388, 49.868)

## Default Settings

| Setting | Value | Location |
|---------|-------|----------|
| Map Center | 40.3856, 49.8671 | Baku, Azerbaijan |
| Zoom Level | 13 | City-wide view |
| Search Bounds | 48.5-50.5°E, 39.5-41°N | Baku area |
| Marker Color | #C9A96E | Gold (brand color) |
| Marker Size | 10px radius | Visible from zoom 13+ |

## API Endpoints Used

### Nominatim Geocoding
```
GET https://nominatim.openstreetmap.org/search
Params:
  - q: location name
  - format: json
  - viewbox: 48.5,39.5,50.5,41 (Baku bounds)
  - bounded: 1 (limit to viewbox)
  - limit: 1 (top result only)

Response:
  [{ lat, lon, display_name, type, ... }]
```

### Browser Geolocation
```javascript
navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    // Calculate distance from shop
});
```

## Database Schema

### shops table
```sql
ALTER TABLE shops ADD COLUMN latitude DECIMAL(10,8);
ALTER TABLE shops ADD COLUMN longitude DECIMAL(11,8);
ALTER TABLE shops ADD COLUMN updated_at DATETIME;
```

### shop_settings table
```sql
CREATE TABLE shop_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shop_id INT UNIQUE,
    location_mode ENUM('manual','auto') DEFAULT 'manual',
    map_visible BOOLEAN DEFAULT false,
    show_distance BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Common Searches (Testing)

```
Search: "Flame Towers"     → Result: Iconic Baku landmark
Search: "Baku Park"        → Result: Large park in city
Search: "Old City"         → Result: Historic walled city
Search: "Heydar Aliyev"    → Result: Modern museum building
Search: "Seaside Boulevard"→ Result: Waterfront promenade
```

## JavaScript Key Functions

### Owner View
```javascript
// Open map modal
document.getElementById('open-map-picker-btn').click()

// Search location
searchLocation()  // Calls Nominatim API

// Place marker
addMarker(lat, lng)

// Update coordinate display
updateBadges()

// Save location
document.getElementById('confirm-location-btn').click()
```

### Client View
```javascript
// Show map
document.getElementById('shopMapModal').show()

// Map initializes on modal show event
document.getElementById('shopMapModal').addEventListener('show.bs.modal', ...)

// Calculate distance
navigator.geolocation.getCurrentPosition(...)
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Search doesn't work | Check internet (Nominatim API needs access) |
| Map doesn't load | Reload page, ensure Leaflet.js CDN accessible |
| Coordinates not saving | Check browser console (F12) for errors |
| Wrong default location | Already fixed (was NYC, now Baku) |
| Button stays "Searching..." | Try different location name |

## Code Snippets

### Validate Coordinates
```javascript
// Always parse as number!
const lat = parseFloat(req.body.latitude);
const lng = parseFloat(req.body.longitude);

// Validate ranges
if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error('Invalid coordinates');
}
```

### Fetch with Settings
```javascript
// In controller
const shop = await Shop.findById(shopId);
const settings = await ShopSetting.findByShopId(shopId);

// Render only if owner enabled it
if (shop.latitude && shop.longitude && settings.map_visible) {
    // Show map button
}
```

### Initialize Leaflet Map
```javascript
// Only on demand (lazy load)
const map = L.map('map-container').setView([lat, lng], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
}).addTo(map);

// Clean up when done
map.off();
map.remove();
```

## UI Elements

### Search Input
```html
<input type="text" id="location-search-input"
       placeholder="e.g., Central Baku, Old City, etc.">
<button id="location-search-btn">Search</button>
```

### Coordinate Badges
```html
<span id="selected-lat" class="badge bg-secondary">Not selected</span>
<span id="selected-lng" class="badge bg-secondary">Not selected</span>
<!-- Turn green when coordinates set -->
```

### Map Modal
```html
<div class="modal" id="locationPickerModal">
    <div class="modal-body">
        <div id="location-picker-map" style="height: 400px;"></div>
    </div>
</div>
```

## Performance Tips

- **Lazy Loading**: Maps load only when modal opens
- **Memory Cleanup**: Maps are destroyed when modal closes
- **CDN Caching**: Leaflet.js loaded once per page
- **API Calls**: Nominatim requests only on search button click
- **Geolocation**: Only requested if owner enabled distance display

## Browser Support

✅ Chrome / Chromium
✅ Firefox
✅ Safari
✅ Edge
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Next Steps (Optional)

Future enhancements:
- [ ] Autocomplete search suggestions
- [ ] Recent search history
- [ ] Multiple search results dropdown
- [ ] Reverse geocoding (click map → show address)
- [ ] Map layer toggle (Map/Satellite/Terrain)
- [ ] Directions button (Google Maps/Apple Maps)
- [ ] Nearby shops display

---

## 📞 Quick Help

**Q: Where is location search code?**
A: `views/owner/shop-setup.ejs` lines 221-290

**Q: How to change default map center?**
A: `views/owner/shop-setup.ejs` line 225-226
```javascript
const currentLat = parseFloat(latInput.value) || 40.3856;  // Change here
const currentLng = parseFloat(lngInput.value) || 49.8671;  // Change here
```

**Q: How to add new coordinates to database?**
A: Run migration: `node migrate-add-coordinates.js`

**Q: How to test if everything is set up?**
A: Run: `node test-db.js`

**Q: Why use Nominatim instead of Google Maps?**
A: Free, no API key required, respects privacy, open-source

---

**Version**: 1.0 Complete
**Status**: ✅ Production Ready
**Last Updated**: 2024
