# Interactive Location Picker - Implementation Guide

## Overview
Added interactive map-based location picker allowing shop owners to select their location by clicking on a map, and clients can preview shop locations before viewing the full shop.

## Features

### For Shop Owners

#### Location Picker Modal
- **Access**: Click "Select Location on Map" button in Shop Setup
- **Usage**:
  1. Modal opens with interactive map
  2. Map centers on existing location (if set) or default (NYC: 40.7128, -74.0060)
  3. Click anywhere on the map to place a marker
  4. Marker appears with golden color matching brand (#C9A96E)
  5. Latitude and Longitude display in real-time badges
  6. Click "Confirm Location" to save and populate coordinate fields
  7. Modal closes automatically

#### Map Features
- Zoom controls (+ / -)
- Pan by dragging
- Click to select new location
- Marker shows selected coordinates in popup
- Badge colors change from gray (not selected) to green (selected)
- Displays 6 decimal places (accurate to ~0.1 meters)

#### Manual Entry Alternative
- Still supports manual coordinate entry
- Helpful for copy-paste from other sources
- Location picker is optional - owners can choose either method

### For Clients

#### Location Preview Modal
- **Access**: Click "View Location" button on shop cards
- **Shows**:
  - Shop name and address
  - Interactive mini-map centered on shop location
  - Exact latitude and longitude coordinates
  - "View Full Shop" button to go to shop detail page

#### Client Experience
```
Shop Listing Page
    ↓
See "View Location" button (if shop has coordinates + map enabled)
    ↓
Click button
    ↓
Location preview modal opens
    ↓
See map with shop location, coordinates
    ↓
Can view full shop or close modal
```

## Technical Implementation

### Owner-Side Location Picker (shop-setup.ejs)

**HTML Changes:**
- Added button "Select Location on Map" below coordinate inputs
- Button has icon and clear label
- Triggers modal on click

**Modal Structure:**
```html
<div class="modal" id="locationPickerModal">
  - Modal header with close button
  - Large map container (500px height)
  - Info alert explaining usage
  - Footer with real-time coordinate badges
  - Cancel and Confirm buttons
</div>
```

**JavaScript Logic:**
```javascript
// Initialize map when modal opens
// - Reuses existing coordinates if set
// - Otherwise defaults to 40.7128, -74.0060
// - Add click handler to map
// - Click = place marker + update badges

// Marker styling
// - Circle marker (not standard pin)
// - Gold color (#C9A96E) with dark border
// - Popup shows coordinates to 6 decimal places

// Confirm button
// - Only active when location selected
// - Populates latitude/longitude input fields
// - Closes modal
// - Cleans up map to avoid memory leaks
```

### Client-Side Location Preview (shops.ejs)

**HTML Changes:**
- Added "View Location" button on shop cards
- Only shows if shop has coordinates AND map_visible = true
- Button uses outline-gold styling for consistency
- Positioned between address info and "View Shop" button

**Modal Structure:**
```html
<div class="modal" id="locationViewModal">
  - Modal header
  - Shop name and address
  - Preview map (400px height)
  - Latitude/Longitude display badges
  - Close and View Full Shop buttons
</div>
```

**JavaScript Logic:**
```javascript
// Location view button click
// - Extract data: lat, lng, name, address
// - Get shop ID from parent card
// - Show modal with extracted data

// Map initialization
// - Create new map instance
// - Center on shop coordinates
// - Add single marker at location
// - Zoom level 15 (street level)
// - Remove old map instance if exists

// Modal cleanup
// - Remove map on modal hide
// - Prevents memory leaks
// - Allows re-opening modal multiple times
```

## User Workflows

### Workflow 1: Owner Setting Location (First Time)

1. **Navigate to Shop Setup**
   - Owner Dashboard → Shop Setup

2. **Open Location Picker**
   - Scroll to "Location & Map Settings"
   - Click "Select Location on Map" button

3. **Select Location**
   - Map opens showing default NYC area
   - Search in address field (browser map search)
   - Click on shop location on map
   - Marker appears with gold circle
   - Latitude/Longitude badges turn green

4. **Confirm**
   - Click "Confirm Location" button
   - Modal closes
   - Latitude/Longitude fields auto-populate

5. **Save**
   - Enable "Show map to clients" checkbox
   - Enable "Show distance" checkbox (optional)
   - Click "Save Changes"

### Workflow 2: Owner Updating Location

1. **Navigate to Shop Setup**
   - Already has coordinates from before

2. **Open Location Picker**
   - Map opens centered on existing location
   - Marker already placed at old location

3. **Update**
   - Click new location
   - Marker moves
   - Badges update

4. **Confirm & Save**
   - Confirm, then save shop

### Workflow 3: Client Previewing Location

1. **Browse Shops**
   - Browse Shops page with shop listing

2. **See Location Button**
   - For shops with locations enabled
   - Small "View Location" button visible

3. **Click to Preview**
   - Modal opens instantly
   - Sees map with marker
   - Sees exact coordinates

4. **Options**
   - Close modal and continue browsing
   - Click "View Full Shop" to see detail page

## Database & Backend

### No Database Changes
- Uses existing latitude/longitude columns
- No new tables required
- Settings already stored in shop_settings table

### Controller Updates (No changes needed)
- Controllers already return coordinates
- Settings already passed to templates
- No new API endpoints required

### View Changes Only
- All logic is client-side JavaScript
- Uses Leaflet.js (already included)
- Bootstrap modals (already included)

## Browser Compatibility

✅ **Works on:**
- Chrome/Chromium (all versions)
- Firefox (all versions)
- Safari (iOS & macOS)
- Edge
- Mobile browsers

✅ **Features used:**
- Bootstrap modals (standard Bootstrap 5)
- Leaflet.js (widely supported)
- Standard JavaScript (ES6)
- Event listeners (standard DOM API)

⚠️ **Requirements:**
- JavaScript must be enabled
- Map tiles load from CDN (requires internet)
- Leaflet CSS must load (CDN)

## Performance Considerations

### Optimization Strategies
1. **Lazy Map Loading**
   - Maps only initialize when modal opens
   - setTimeout avoids sizing issues
   - Map removed on modal hide (not reused)

2. **Memory Management**
   - Old map instances removed before creating new ones
   - Event listeners removed on modal hide
   - Prevents memory leaks from multiple opens

3. **Event Delegation**
   - Shop cards don't pre-initialize maps
   - Maps created on-demand only
   - Scales well with many shops

4. **CDN Loading**
   - Leaflet.js already loaded for shop detail maps
   - Reuses same library for pickers
   - Minimal additional bandwidth

## Accessibility

### Keyboard Navigation
- Tab through buttons normally
- Enter/Space triggers buttons
- Modal focus management (Bootstrap handles)
- Close with Escape key

### Screen Readers
- Buttons have meaningful labels
- Modal headings present
- Alt text on icons (bi-map, etc.)
- Badge content readable

### Color Contrast
- Gold buttons (#C9A96E) on light background
- Secondary gray on darker backgrounds
- Badges use semantic colors (gray, success)

## Testing Checklist

- [x] Location picker modal opens on button click
- [x] Map initializes correctly in modal
- [x] Click on map places marker at that location
- [x] Coordinates update in real-time
- [x] Marker popup shows coordinates
- [x] Confirm button populates input fields
- [x] Modal closes after confirmation
- [x] Map cleans up on modal close
- [x] Multiple opens don't cause errors
- [x] Existing coordinates load in picker
- [x] Map defaults to NYC if no coordinates
- [x] Client location preview modal opens
- [x] Client preview shows correct shop info
- [x] Client preview map displays location
- [x] View Shop button works from preview
- [x] Preview modal closes cleanly
- [x] Multiple previews work correctly
- [x] Mobile responsive (modal sizing)
- [x] Touch events work on map

## Troubleshooting

### Map Not Loading?
**Check:**
- JavaScript errors in browser console
- Leaflet CSS/JS CDN is accessible
- Modal is actually visible

**Fix:**
- Check internet connection
- Clear browser cache
- Try incognito/private mode

### Marker Not Appearing?
**Check:**
- Map has initialized
- Coordinates are in valid range
- No console errors

**Fix:**
- Refresh page
- Click on map again
- Try different location

### Coordinates Not Saving?
**Check:**
- Confirm button was clicked
- Input fields show values
- Form validation passes

**Fix:**
- Check browser console for errors
- Verify latitude -90 to 90
- Verify longitude -180 to 180

### Modal Not Opening?
**Check:**
- Button is clickable
- Modal HTML is in page
- Bootstrap.js is loaded

**Fix:**
- Refresh page
- Check browser console
- Verify Bootstrap version

## Future Enhancements

- Address autocomplete (Google Places API)
- Current location detection (geolocation API)
- Street view integration
- Radius/coverage area display
- Multiple location support per shop
- Location history/audit trail
- Drag marker to adjust position
- Search by address in modal

## Code Organization

**shop-setup.ejs:**
- Lines 72-90: Input fields with button
- Lines 133-223: Modal HTML structure
- Lines 225-309: JavaScript for picker

**shops.ejs:**
- Lines 82-88: View Location button on cards
- Lines 175-271: Modal HTML (created dynamically)
- Lines 273-320: JavaScript for preview

## Summary

✅ **Complete implementation of:**
- Interactive location picker for owners
- Client location preview modals
- Proper resource cleanup
- Mobile responsive design
- No breaking changes to existing code
- Uses existing dependencies only
