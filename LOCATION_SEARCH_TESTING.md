# 🧪 Location Search - Quick Testing Guide

## ✅ Quick Start (30 seconds)

1. **Restart Server**
```bash
npm start
```

2. **Test Location Search**
   - Open browser: `http://localhost:3000`
   - Login as shop owner
   - Go to **Shop Setup**
   - Click **"Select Location on Map"** button
   - Type `"Flame Towers"` in search box
   - Click **Search** (or press Enter)
   - ✅ Map should center on Flame Towers with golden marker
   - ✅ Coordinates should appear in badges (green)
   - Click **"Confirm Location"**
   - Click **"Save Changes"**

## 🎯 What Was Added

### Location Search Feature (Complete)
- ✅ Search input in location picker modal
- ✅ Search by location name (geocoding via Nominatim API)
- ✅ Baku-focused search results (viewbox: 48.5-50.5°E, 39.5-41°N)
- ✅ Enter key support
- ✅ Loading state with spinner icon
- ✅ Auto-clear search after result
- ✅ Error handling for not found
- ✅ Default map center: Baku (40.3856, 49.8671)
- ✅ Default zoom: 13 (city-wide view)

## 🚀 Testing Scenarios

### Scenario 1: Basic Search
**What to test**: Search works and map centers correctly

```
1. Open Shop Setup
2. Click "Select Location on Map"
3. Type: "Flame Towers"
4. Click "Search"
   EXPECTED: Map centers on Flame Towers, marker appears
5. Confirm and Save
   EXPECTED: Shop saved with coordinates
```

### Scenario 2: Enter Key
**What to test**: Can use Enter key instead of button click

```
1. Open location picker
2. Type: "Baku Park"
3. Press Enter
   EXPECTED: Search works same as clicking button
```

### Scenario 3: Multiple Searches
**What to test**: Can search multiple times in one session

```
1. Open location picker
2. Search "Flame Towers"
3. Map centers on Flame Towers ✓
4. Search "Old City" (without closing modal)
5. Map now centers on Old City ✓
6. Marker updates, coordinates change
   EXPECTED: No errors, smooth transitions
```

### Scenario 4: Not Found
**What to test**: Proper error handling

```
1. Open location picker
2. Type: "xyz123nonexistent"
3. Click Search
   EXPECTED: Alert "Location not found. Please try a different search term."
4. Button returns to normal state
```

### Scenario 5: Manual + Search Combined
**What to test**: Can mix search with manual clicking

```
1. Open location picker
2. Search "Central Baku"
3. Map centers on Central Baku ✓
4. Click on map at a different location
5. Marker moves, coordinates update
   EXPECTED: Works smoothly
6. Search "Flame Towers" again
7. Map refocuses on Flame Towers
   EXPECTED: No conflicts between methods
```

### Scenario 6: Empty Search
**What to test**: Input validation

```
1. Open location picker
2. Click Search without typing
   EXPECTED: Alert "Please enter a location name"
3. Button remains enabled
4. Can still search after alert dismisses
```

## 📍 Test Locations (Baku)

All these should work:

| Location | Search Term | Expected Coords |
|----------|------------|-----------------|
| Flame Towers | "Flame Towers" | ~40.388, 49.868 |
| Baku Park | "Baku Park" | ~40.390, 49.869 |
| Old City | "Old City" | ~40.365, 49.836 |
| Central Baku | "Central Baku" | ~40.386, 49.867 |
| Heydar Aliyev | "Heydar Aliyev Center" | ~40.392, 49.881 |
| Seaside Blvd | "Seaside Boulevard" | ~40.369, 49.835 |
| Bibi-Heybat | "Bibi-Heybat" | ~40.346, 49.872 |

## 🐛 Debugging

### If search doesn't work:

**Check 1: Browser Console**
```
Press F12 → Console tab → Look for errors
Should see no red errors when searching
```

**Check 2: Network Tab**
```
Press F12 → Network tab → Search
Should see request to nominatim.openstreetmap.org
Response should be 200 OK with JSON data
```

**Check 3: Server Console**
```
Watch npm start console output
Should see no errors when searching
```

### Common Issues:

| Issue | Cause | Fix |
|-------|-------|-----|
| Search button disabled forever | API timeout | Refresh page, try again |
| Map doesn't center | API returned no results | Try different location name |
| Coordinates not showing | Missing updateBadges() call | Check browser console |
| Can't press Enter | Event listener not attached | Refresh page |

## 📊 Code Changes Summary

**File**: `views/owner/shop-setup.ejs`

**Lines 221-233**: Search event listeners
- Button click handler
- Enter key handler
- Both call `searchLocation()` function

**Lines 235-290**: `searchLocation()` function
- Validates input
- Shows loading state
- Calls Nominatim API with Baku viewbox
- Centers map on result
- Updates badges
- Clears input
- Handles errors

**Lines 225-226**: Default map center
```javascript
const currentLat = parseFloat(latInput.value) || 40.3856;  // Baku
const currentLng = parseFloat(lngInput.value) || 49.8671;  // Baku
```

**Line 228**: Zoom level
```javascript
locationPickerMap = L.map('location-picker-map').setView([currentLat, currentLng], 13);
```

## ✅ Verification Checklist

After testing, verify:

- [ ] Search works for common Baku locations
- [ ] Map centers on search result
- [ ] Coordinates appear in badges (green)
- [ ] Loading state shows while searching
- [ ] Enter key triggers search
- [ ] Multiple searches work without issues
- [ ] Error alert shows for not-found locations
- [ ] Search input clears after success
- [ ] Can combine search + manual clicking
- [ ] Manual clicking still works
- [ ] Can save shop with searched location
- [ ] Client sees "View on Map" button
- [ ] Client can view shop on map
- [ ] No JavaScript errors in console
- [ ] No server errors in npm start output

## 🎉 Success Criteria

Feature is working correctly if:
1. ✅ Can type location name and search
2. ✅ Map centers on search result (within 5 seconds)
3. ✅ Marker appears at searched location
4. ✅ Coordinates shown in green badges
5. ✅ Can confirm and save shop
6. ✅ Client can see "View on Map" button
7. ✅ No errors in browser console or server

---

**Ready to test!** Start your server and try searching for "Flame Towers" in the location picker.

🚀 **Happy testing!**
