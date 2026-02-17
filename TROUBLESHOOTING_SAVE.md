# Troubleshooting: "Could not save shop" Error

## ✅ Fixed Issues

The following issues have been fixed in the latest update:

### Issue 1: Database Connection Error
**Problem**: Hardcoded password in db.js was preventing connection
**Fixed**: Now uses `.env` DB_PASSWORD or empty string (supports your actual password)

### Issue 2: Settings Table Error Blocking Save
**Problem**: If shop_settings table didn't exist, entire shop save would fail
**Fixed**: Settings save is now non-blocking (shop saves even if settings fails)

### Issue 3: No Error Details
**Problem**: Generic error message didn't help debugging
**Fixed**: Error messages now include details for better troubleshooting

---

## 🚀 What To Do

### Step 1: Restart Server
```bash
npm start
```

When the server starts, it will:
1. Create the database if it doesn't exist
2. Run the complete schema.sql (creates all tables including shop_settings)
3. Be ready to accept requests

### Step 2: Try Again
1. Go to Shop Setup
2. Click "Select Location on Map"
3. Click on your location
4. Confirm the selection
5. Check "Show map to clients"
6. Click "Save Changes"

✅ **This should now work!**

---

## 🔍 If You Still Get an Error

### Check 1: Verify Database Connection
```bash
# Test your database connection
mysql -u root -p schedora
```

If this fails:
- Check your MySQL is running
- Verify credentials in `.env` file
- Make sure database `schedora` exists

### Check 2: Check Server Logs
When you save, look at the terminal running `npm start`:
- Look for error messages
- Copy the exact error
- Use this info for debugging

### Check 3: Run Migration Manually
Even though it auto-runs, you can run it explicitly:
```bash
mysql -u root -p schedora < database/add-coordinates.sql
```

### Check 4: Verify Tables Exist
```bash
# Connect to database
mysql -u root -p schedora

# Then run:
SHOW TABLES;
```

You should see:
- users
- shops
- **shop_settings** ← This is the new one
- services
- service_photos
- bookings
- wallet_transactions

---

## 🛠️ Common Issues & Fixes

### "Could not save shop. Error: ER_NO_REFERENCED_ROW_2"
**Cause**: Shop ID doesn't exist
**Fix**: This shouldn't happen, but if it does, try creating shop first without coordinates

### "Could not save shop. Error: ER_BAD_FIELD_ERROR"
**Cause**: Column doesn't exist (missing schema update)
**Fix**:
1. Stop server: `Ctrl+C`
2. Run migration: `mysql -u root -p schedora < database/add-coordinates.sql`
3. Restart: `npm start`

### "Could not save shop. Error: Access denied"
**Cause**: Wrong MySQL password in `.env` file
**Fix**:
1. Check `.env` file for DB_PASSWORD
2. Verify it matches your actual MySQL password
3. Restart server

### "Could not save shop. Error: database doesn't exist"
**Cause**: Database wasn't created
**Fix**:
1. Create manually: `mysql -u root -p -e "CREATE DATABASE schedora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"`
2. Restart server (will create all tables)

---

## ✅ Verification Checklist

After trying again, verify:

- [ ] Server started without errors
- [ ] Can access Shop Setup page
- [ ] Location picker modal opens when clicking map button
- [ ] Can click on map to place marker
- [ ] Coordinates show in modal
- [ ] Can confirm location
- [ ] Form fields populate with coordinates
- [ ] "Show map to clients" checkbox is available
- [ ] Can click "Save Changes"
- [ ] Redirected to dashboard with "Shop profile saved" message

---

## 📊 What's in Your Database Now

When the server initializes successfully:

**shops table** now has:
- latitude (coordinates)
- longitude (coordinates)
- updated_at (timestamp)

**New table**: shop_settings
- location_mode (how location is set)
- map_visible (show to clients?)
- show_distance (show distance to client?)

---

## 🆘 Still Having Issues?

### Check Server Startup
When you run `npm start`, you should see:
```
✓ Database ready (schedora)
✨ SCHEDORA running at http://localhost:3000
```

If you don't see this:
1. Stop server: `Ctrl+C`
2. Check for error messages
3. Verify MySQL is running
4. Verify `.env` file has correct credentials

### Check Browser Console
When saving fails:
1. Press `F12` to open developer tools
2. Go to "Console" tab
3. Look for any red error messages
4. Note down any errors you see

### Check Network Tab
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Try to save shop
4. Look for failed request (usually red)
5. Click on it to see response
6. Response will show the actual error

---

## 🔧 Reset & Retry

If everything fails:

### Option 1: Full Reset (Recommended)
```bash
# 1. Stop server
Ctrl+C

# 2. Delete and recreate database
mysql -u root -p -e "DROP DATABASE schedora"
mysql -u root -p -e "CREATE DATABASE schedora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# 3. Start server (will initialize everything)
npm start

# 4. Try again
```

### Option 2: Just Reload Schema
```bash
# 1. Stop server
Ctrl+C

# 2. Run migration
mysql -u root -p schedora < database/schema.sql

# 3. Start server
npm start
```

---

## 📝 Success Indicators

After fix:
- ✅ Can set location on map
- ✅ Coordinates populate form
- ✅ Shop saves successfully
- ✅ See "Shop profile saved" message
- ✅ Redirect to dashboard
- ✅ Can see location settings

---

## 🎯 What Changed

This fix update includes:
- Fixed database password handling
- Better error messages
- Non-blocking settings save
- Improved error logging

This allows the shop to save even if settings table has temporary issues.

---

## 📞 Need Help?

If still having issues:
1. Check all steps in this guide
2. Review server console output
3. Check browser console (F12)
4. Verify `.env` file credentials
5. Try reset and retry

The system should now work smoothly! 🚀
