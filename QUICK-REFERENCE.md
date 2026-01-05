# 🚀 Quick Reference - Signature Marketing Package

## Login Credentials

### Admin
- **URL:** index.html
- **Email:** kayla@kaylasierra.com
- **Password:** admin123
- **Change password after first login!**

### Demo Client
- **Email:** demo@example.com
- **Password:** demo123

---

## Admin Quick Actions

### Welcome Messages
1. Click "Welcome Messages" in sidebar
2. Set global message for all clients
3. Or create custom message for specific client
4. Uses rich text editor
5. Toggle Active/Inactive

### Module Building
1. Click "Module Builder" in sidebar
2. Select module from dropdown
3. Add/Edit/Reorder content
4. See stats for each module
5. Focus on one module at a time

### File Management
1. Click "File Manager" in sidebar
2. Upload files by URL
3. Set download/copy permissions
4. Preview before assigning
5. Add to modules as "Embedded File"

### Client Management
1. Click "Manage Clients"
2. Add/Edit/Delete clients
3. Set passwords
4. Active/Inactive toggle
5. Set expiration dates

### Module Assignment
1. Click "Client Modules"
2. Select client
3. Check modules to assign
4. Click "Save Module Assignments"
5. Client sees only assigned modules

---

## Client Features

### Dashboard
- See assigned modules
- View all content types
- Mark items complete
- Track progress
- Access CTAs

### Night Mode
- Toggle in sidebar (above Logout)
- Preference saved
- Full dark theme
- Smooth transitions

### Welcome Popup
- Shows once per day
- Custom or global message
- Personalized greeting
- "Get Started" button

### Review Request
- Appears every 30-60 minutes
- 5-star rating system
- If 5 stars: link to review page
- If less: thank you message
- 2-month suppression after 5-star

### Benchmark Call
- Shows 3 months after account creation
- Reappears every 3 months
- Links to scheduling page
- "Maybe Later" option

---

## File Viewer

### Supported Types
- **HTML:** Full display with copy buttons
- **PDF:** Preview with zoom
- **DOCX/XLSX/PPTX:** Download interface

### Controls
- Zoom: 50% to 200%
- Download button (if enabled)
- Close button
- Copy protection

---

## Database Tables

### Content
- `modules` - All modules
- `content_items` - Module content
- `uploaded_files` - Embedded files
- `client_modules` - Module assignments

### Users
- `users` - Admin and clients
- `client_greetings` - Custom welcome messages
- `global_welcome_message` - Global welcome

### Progress
- `user_progress` - Completion tracking

---

## Key URLs

### Admin Pages
- admin.html - Dashboard
- welcome-messages.html - Welcome management
- module-builder.html - Module builder
- file-upload.html - File manager
- client-modules.html - Module assignment

### Client Pages
- index.html - Login
- dashboard.html - Client view
- file-viewer.html - File viewer

### External Links
- https://fera.review/vb2 - Reviews
- https://wix.to/XgXUSVb - Benchmark call
- https://wix.to/IYtKXqT - Deep dive
- https://www.kaylasierra.com - Main site

---

## Testing in Console

### Show Modals Immediately
```javascript
// Show welcome modal
showGreetingModal();

// Show benchmark modal
showBenchmarkCallModal();

// Show review modal
showReviewModal();
```

### Check Storage
```javascript
// See what's stored
console.log(localStorage);
console.log(sessionStorage);

// Clear review timing (to test again)
const session = auth.getSession();
localStorage.removeItem(`lastReviewRequest_${session.userId}`);
localStorage.removeItem(`reviewCompleted_${session.userId}`);

// Clear benchmark timing
localStorage.removeItem(`lastBenchmarkCall_${session.userId}`);

// Clear greeting for today
const key = `greetingShown_${session.userId}_${new Date().toDateString()}`;
sessionStorage.removeItem(key);
```

---

## Common Issues

### "Module dropdown shows undefined"
- Fixed! Uses module.module_name || module.title || 'Untitled Module'

### "DOCX file won't preview"
- Expected! Shows download button instead
- Local files can't use online viewer

### "Review modal not showing"
- Check: Already shown in last 2 months?
- Check: Less than 30 minutes since last request?
- Test: Run `showReviewModal()` in console

### "Benchmark not showing for new account"
- Expected! Only shows 3 months after account creation
- Test: Run `showBenchmarkCallModal()` in console

### "Welcome popup not showing"
- Check: Already shown today?
- Test: Clear sessionStorage and refresh
- Test: Run `showGreetingModal()` in console

### "Night mode not saving"
- Check: localStorage enabled in browser?
- Check: Not in incognito mode?

---

## Setup Checklist

### First Time Setup (30 minutes)
- [ ] Log in as admin
- [ ] Change admin password
- [ ] Set global welcome message
- [ ] Upload 1-2 test files
- [ ] Build 1-2 modules with content
- [ ] Create test client account
- [ ] Assign modules to test client
- [ ] Log in as test client
- [ ] Test all features
- [ ] Deploy to production

### Content Creation (2-3 hours)
- [ ] Create all 8 modules
- [ ] Upload all files
- [ ] Add content to each module
- [ ] Write custom welcome messages for VIP clients
- [ ] Test each module thoroughly
- [ ] Preview as client

### Client Onboarding
- [ ] Create client account
- [ ] Set secure password
- [ ] Assign appropriate modules
- [ ] Add custom welcome message (optional)
- [ ] Send login credentials
- [ ] Brief client on features

---

## Design Colors

- Primary: `#db8a70` (luxe coral)
- Hover: `#c77959` (darker coral)
- Dark Text: `#2d2d2d`
- Light Text: `#666666`
- Background: `#ffffff`
- Light BG: `#f9f9f9`
- Border: `#e0e0e0`

### Night Mode Colors
- Background: `#1a1a1a`
- Card: `#2d2d2d`
- Text: `#e0e0e0`
- Border: `#404040`

---

## Status Indicators

### Content Types
- 📝 Text/Rich Content
- 🎥 Video Embed
- 📥 Downloadable File
- 📄 Embedded File (Viewer)
- 🔗 External Link

### User Status
- 🟢 Active
- 🔴 Inactive
- ⏰ Expiration Date Set

### Module Status
- ✅ Assigned
- ⬜ Not Assigned
- 📊 Progress: X/Y Complete

---

## Keyboard Shortcuts (Future Enhancement)

Currently no keyboard shortcuts implemented.
Consider adding:
- `Ctrl+K` - Quick search
- `Ctrl+N` - New content
- `Esc` - Close modal
- `Ctrl+S` - Save (in forms)

---

## Browser Compatibility

✅ **Fully Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

⚠️ **Limited Support:**
- IE 11 (not recommended)

**Requirements:**
- JavaScript enabled
- LocalStorage enabled
- Cookies enabled (for sessions)

---

## Performance Notes

### Load Times
- Initial load: ~1-2 seconds
- Module load: ~500ms
- File preview: 1-3 seconds (depends on file size)

### Optimization Tips
- Keep file URLs on fast CDNs
- Limit modules to 8-10 per client
- Use HTML files for best preview experience
- Keep rich text content reasonable size

---

## Security Notes

### Authentication
- Session-based (24 hours)
- Stored in localStorage
- Admin check for protected pages
- Automatic logout on session expire

### Best Practices
- Change default admin password
- Use strong client passwords
- Set expiration dates for temporary access
- Review active clients regularly
- Keep admin credentials secure

---

## Support Resources

### Documentation Files
- FINAL-COMPLETE-FEATURES.md - Complete feature list
- README.md - Full documentation
- START-HERE.md - Getting started
- EMBEDDED-FILES-GUIDE.md - File management
- MODULE-MANAGEMENT-GUIDE.md - Module system

### Testing Files
- setup-demo.html - Auto-setup demo
- Demo client for testing

---

## 🎉 You're Ready!

Everything is set up and tested. Time to:

1. **Customize** - Add your content
2. **Test** - Try all features
3. **Deploy** - Publish tab
4. **Onboard** - Add clients

**Start at:** index.html  
**Admin login:** kayla@kaylasierra.com / admin123

Happy marketing! 🚀
