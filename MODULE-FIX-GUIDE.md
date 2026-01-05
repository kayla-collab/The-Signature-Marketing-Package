# 🔧 Module Error Fix Guide

## The Problem

You're getting "Error saving module" with a 500 server error when trying to create or edit modules in the Module Builder.

## Root Cause

The issue is likely caused by one of these:
1. **Old modules with incompatible field names** (using `module_name` instead of `title`)
2. **Missing required fields** in existing modules
3. **Database inconsistencies**

## Solution - 3 Easy Steps

### ✅ Step 1: Run the Fix Utility

1. **Go to:** `https://bd626c36-be0c-4fec-8c1f-d6503f31da63.vip.gensparksite.com/fix-modules.html`

2. **Click "Analyze Modules"** to see what issues exist

3. **Click "Fix All Issues"** to automatically repair the database

4. **Wait for completion** - you'll see a green success message

### ✅ Step 2: Test with Debug Tool (Optional)

If you want to verify everything works:

1. **Go to:** `https://bd626c36-be0c-4fec-8c1f-d6503f31da63.vip.gensparksite.com/debug-modules.html`

2. **Click "List All Modules"** to see your modules

3. **Try "Create Minimal Module"** to test creating

4. **Try "Create Full Module"** to test with rich text

### ✅ Step 3: Use Module Builder Normally

1. **Go to:** `https://bd626c36-be0c-4fec-8c1f-d6503f31da63.vip.gensparksite.com/module-builder.html`

2. **Log in** with admin credentials

3. **Try creating a new module** - it should work now!

The improved error handling will now show you **exactly** what's wrong if any error occurs.

---

## What Was Fixed

### 1. Database Fix Utility (`fix-modules.html`)
- Automatically detects modules with old field names
- Converts `module_name` → `title`
- Fixes missing `order_index` values
- Safe to run multiple times

### 2. Improved Error Messages (`module-builder.js`)
- Shows exact error messages from server
- Logs detailed debugging info to console
- Validates data before sending
- Better user feedback

### 3. Debug Tool (`debug-modules.html`)
- Test API endpoints directly
- See exact request/response data
- Verify modules load correctly

---

## Still Having Issues?

### Check Browser Console (F12)

1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Try creating a module
4. Look for red error messages
5. Share the error messages for further help

### Common Issues & Solutions

#### "Module name is required"
- **Solution:** Make sure to enter a module name

#### "Display order must be 1 or higher"
- **Solution:** Enter a valid number (1, 2, 3, etc.)

#### "Server error (500)"
- **Solution:** Run the fix utility at `fix-modules.html`

#### "Network error"
- **Solution:** Check your internet connection

---

## Creating Your First Module

Once everything is fixed:

1. **Go to Module Builder**
2. **Click "Create New Module"**
3. **Fill in:**
   - Module Name: "The Long-Game Engine"
   - Description: "YouTube content planning system"
   - Display Order: 1
4. **Click "Save Module"**
5. **Select the module** from dropdown
6. **Click "Add Content"** to add content items

---

## Adding Rich Text Content

When adding content to a module:

1. **Select Content Type**: "Text / Rich Content"
2. **Use the rich text editor** for formatting:
   - **Bold**, *italic*, lists
   - Headings, links
   - Embedded HTML
3. **For files**: Use "Embedded File (Viewer)" and select from uploaded files
4. **For videos**: Use "Video Embed" and paste YouTube/Zoom URL

---

## Need More Help?

- Check `README.md` for full documentation
- Check `START-HERE-FINAL.md` for quick start guide
- All tools are at your deployed URL: `bd626c36-be0c-4fec-8c1f-d6503f31da63.vip.gensparksite.com`

---

## Files Created to Fix Your Issue

1. **`fix-modules.html`** - Automatic database repair tool
2. **`debug-modules.html`** - API testing and diagnostics
3. **`js/module-builder.js`** - Improved error handling (updated)
4. **`MODULE-FIX-GUIDE.md`** - This guide

All ready to use immediately! 🎉
