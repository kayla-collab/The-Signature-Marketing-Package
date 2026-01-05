# 🔑 Complete Access & Links Reference

## 🎯 Quick Access

**Start Here:** `index.html`

---

## 👤 Login Credentials

### Admin Account
```
Email:    kayla@kaylasierra.com
Password: admin123
URL:      index.html → redirects to admin.html
```

**⚠️ CRITICAL:** Change this password immediately after first login!

**To Change Password:**
1. Log in as admin
2. Go to "Manage Clients"
3. Find your admin account
4. Click "Edit"
5. Enter new password
6. Click "Save"

### Demo Client Account (For Testing)
```
Email:    demo@example.com
Password: demo123
URL:      index.html → redirects to dashboard.html
```

**Note:** This account needs modules assigned to see content.

**To Set Up Demo:**
1. Open `setup-demo.html` in browser
2. Click "Setup Demo Client & Content"
3. Wait 10 seconds
4. Demo account will have sample modules

---

## 🌐 External URLs

### Review System
- **Review Page:** https://fera.review/vb2
  - **Used in:** Footer, review modal (5-star only)
  - **Purpose:** Collect client testimonials
  - **Timing:** Appears every 30-60 minutes

### Call-to-Action Links
- **Marketing Deep Dive:** https://wix.to/IYtKXqT
  - **Used in:** Dashboard CTA banner, module pages
  - **Purpose:** Book strategy consultation
  
- **Benchmark Call:** https://wix.to/XgXUSVb
  - **Used in:** Quarterly benchmark modal
  - **Purpose:** Schedule 3-month check-ins
  - **Timing:** Every 90 days after account creation
  
- **Coaching Program:** https://www.kaylasierra.com/pricing-plans
  - **Used in:** Dashboard CTA banner
  - **Purpose:** Join coaching program
  
- **Main Website:** https://www.kaylasierra.com
  - **Used in:** Footer copyright link
  - **Purpose:** Link to main business site

---

## 📄 Admin Page URLs

### Main Admin Pages
```
Admin Dashboard:      admin.html
Welcome Messages:     welcome-messages.html  ⭐ NEW
Module Builder:       module-builder.html    ⭐ NEW
File Manager:         file-upload.html       ⭐ NEW
Client Modules:       client-modules.html
```

### Admin Dashboard Sections (Hash Navigation)
```
Manage Clients:       admin.html#clients
Manage Modules:       admin.html#modules
Manage Content:       admin.html#content
Preview as Client:    admin.html#preview
```

---

## 📱 Client Page URLs

### Main Client Pages
```
Login Page:           index.html
Client Dashboard:     dashboard.html
File Viewer:          file-viewer.html?file=[fileId]
```

### Client Dashboard Sections (Hash Navigation)
```
Overview:             dashboard.html#overview
YouTube Module:       dashboard.html#youtube
Instagram Module:     dashboard.html#instagram
LinkedIn Module:      dashboard.html#linkedin
Campus Module:        dashboard.html#campus
Affiliate Module:     dashboard.html#affiliate
Branding Module:      dashboard.html#branding
Strategy Module:      dashboard.html#strategy
Consultation Module:  dashboard.html#consultation
```

---

## 🗄️ Database Tables

### Core Tables
```
users                  - All user accounts (admin + clients)
modules                - All modules
content_items          - Module content
client_modules         - Module assignments per client
progress               - Client completion tracking
```

### New Feature Tables ⭐
```
uploaded_files          - Embedded files library
global_welcome_message  - Global welcome for all clients
client_greetings        - Custom client messages
```

---

## 📁 Key Files

### HTML Pages
```
index.html              - Login page
dashboard.html          - Client dashboard
admin.html              - Admin dashboard
welcome-messages.html   - Welcome message admin (NEW)
module-builder.html     - Module builder (NEW)
file-upload.html        - File manager (NEW)
file-viewer.html        - File viewer (NEW)
client-modules.html     - Module assignment
setup-demo.html         - Demo setup utility
```

### JavaScript Files
```
js/auth.js              - Authentication system
js/dashboard.js         - Client dashboard logic
js/dashboard-modals.js  - Modals, night mode, review (NEW)
js/admin.js             - Admin dashboard
js/welcome-messages.js  - Welcome management (NEW)
js/module-builder.js    - Module builder (NEW)
js/file-upload.js       - File management (NEW)
js/client-modules.js    - Module assignment
```

### CSS Files
```
css/style.css           - All styles (includes night mode)
```

### Documentation Files
```
README.md                       - Main documentation
FINAL-COMPLETE-FEATURES.md      - Complete feature list (NEW)
FINAL-STATUS-COMPLETE.md        - Final status report (NEW)
QUICK-REFERENCE.md              - Quick reference (NEW)
QUICK-REFERENCE.md              - Testing guide (NEW)
VISUAL-FEATURE-SUMMARY.md       - Visual summary (NEW)
MODULE-MANAGEMENT-GUIDE.md      - Module system guide
EMBEDDED-FILES-GUIDE.md         - File system guide
START-HERE.md                   - Getting started
QUICK-START.md                  - Fast setup
```

---

## 🎨 Design Tokens

### Colors
```css
/* Light Mode (Default) */
--primary-color:    #db8a70  /* Luxe coral */
--primary-hover:    #c77959  /* Darker coral */
--text-dark:        #2d2d2d  /* Dark text */
--text-light:       #666666  /* Light text */
--bg-white:         #ffffff  /* White background */
--bg-light:         #f9f9f9  /* Light background */
--border-color:     #e0e0e0  /* Border color */

/* Night Mode ⭐ */
Background:         #1a1a1a  /* Very dark */
Cards:              #2d2d2d  /* Dark gray */
Text:               #e0e0e0  /* Light gray */
Border:             #404040  /* Medium gray */
```

### Fonts
```css
font-family: 'Open Sans', sans-serif;

/* Weights Used */
300 - Light
400 - Regular
600 - Semi-Bold
700 - Bold
```

### Font Sizes
```css
h1: 32px
h2: 26px
h3: 22px
body: 16px
small: 14px
```

---

## 🔧 localStorage Keys

### Authentication
```javascript
'smp_session'                           // Session data (24h expiration)
```

### User Preferences
```javascript
'nightMode'                             // Night mode toggle (true/false)
```

### Review System
```javascript
'lastReviewRequest_[userId]'            // Last review request timestamp
'reviewCompleted_[userId]'              // Last review completion timestamp
```

### Benchmark Calls
```javascript
'lastBenchmarkCall_[userId]'            // Last benchmark call click
```

### Welcome Popup
```javascript
// sessionStorage (per-session)
'greetingShown_[userId]_[date]'        // Welcome shown today
```

---

## 🧪 Testing Utilities

### Console Commands

**Show Modals Immediately:**
```javascript
// Welcome modal
showGreetingModal();

// Benchmark call modal
showBenchmarkCallModal();

// Review request modal
showReviewModal();
```

**Check Current Session:**
```javascript
// Get session data
const session = auth.getSession();
console.log(session);

// Check if logged in
auth.isAuthenticated();

// Check if admin
auth.isAdmin();
```

**Clear Storage for Testing:**
```javascript
// Clear review timing
const session = auth.getSession();
localStorage.removeItem(`lastReviewRequest_${session.userId}`);
localStorage.removeItem(`reviewCompleted_${session.userId}`);

// Clear benchmark timing
localStorage.removeItem(`lastBenchmarkCall_${session.userId}`);

// Clear welcome for today
const key = `greetingShown_${session.userId}_${new Date().toDateString()}`;
sessionStorage.removeItem(key);

// Clear night mode
localStorage.removeItem('nightMode');

// NUCLEAR OPTION: Clear everything
localStorage.clear();
sessionStorage.clear();
```

---

## 📊 Content Type Reference

### Available Content Types
```
1. text             - Text/Rich Content
2. video            - Video Embeds (YouTube, Zoom)
3. download         - Downloadable Files
4. link             - External Links
5. embedded_file    - Embedded Files (Viewer) ⭐ NEW
```

### Content Type Display
```
text:           Shows formatted text/HTML
video:          Shows embedded iframe
download:       Shows download button
link:           Shows "Open Resource" button
embedded_file:  Shows "View File" button
```

---

## 🔐 Security Notes

### Session Management
- **Duration:** 24 hours
- **Storage:** localStorage
- **Key:** `smp_session`
- **Auto-logout:** On expiration or manual logout

### Access Control
```
Admin Pages:
  - admin.html
  - welcome-messages.html
  - module-builder.html
  - file-upload.html
  - client-modules.html

Require: auth.requireAuth() + auth.requireAdmin()
```

```
Client Pages:
  - dashboard.html
  - file-viewer.html

Require: auth.requireAuth()
```

```
Public Pages:
  - index.html (login)

No authentication required
```

### Password Security
- Stored as `password_hash` in database
- Never exposed in UI
- Change admin password immediately
- Use strong passwords for clients

---

## 🎯 Default Module IDs (Hash Navigation)

### Module URL Hashes
```
#youtube        - YouTube Execution Assets
#instagram      - Instagram Execution Assets
#linkedin       - LinkedIn Sponsorship Assets
#campus         - Campus Club Partnership Assets
#affiliate      - Affiliate Marketing Assets
#branding       - Branding & Design Assets
#strategy       - Strategy & Operations
#consultation   - Personal Consultation Access
```

**Note:** These may vary if you create custom modules.

---

## 🌍 API Endpoints (RESTful Table API)

### Base URL
```
Relative URLs (current domain)
```

### Endpoints Used
```
GET     tables/users                    - Get all users
GET     tables/users/{id}               - Get user by ID
POST    tables/users                    - Create user
PUT     tables/users/{id}               - Update user
DELETE  tables/users/{id}               - Delete user

GET     tables/modules                  - Get all modules
POST    tables/modules                  - Create module
PUT     tables/modules/{id}             - Update module
DELETE  tables/modules/{id}             - Delete module

GET     tables/content_items            - Get all content
POST    tables/content_items            - Create content
PUT     tables/content_items/{id}       - Update content
DELETE  tables/content_items/{id}       - Delete content

GET     tables/client_modules           - Get assignments
POST    tables/client_modules           - Create assignment
PUT     tables/client_modules/{id}      - Update assignment
DELETE  tables/client_modules/{id}      - Delete assignment

GET     tables/progress                 - Get progress
POST    tables/progress                 - Track progress
PUT     tables/progress/{id}            - Update progress

GET     tables/uploaded_files           - Get files (NEW)
POST    tables/uploaded_files           - Upload file (NEW)
PUT     tables/uploaded_files/{id}      - Update file (NEW)
DELETE  tables/uploaded_files/{id}      - Delete file (NEW)

GET     tables/global_welcome_message   - Get global msg (NEW)
POST    tables/global_welcome_message   - Create msg (NEW)
PUT     tables/global_welcome_message/{id} - Update msg (NEW)

GET     tables/client_greetings         - Get custom msgs (NEW)
POST    tables/client_greetings         - Create msg (NEW)
PUT     tables/client_greetings/{id}    - Update msg (NEW)
DELETE  tables/client_greetings/{id}    - Delete msg (NEW)
```

---

## 📈 Performance Benchmarks

### Expected Load Times
```
Initial Page Load:     < 2 seconds
Module Navigation:     < 500ms
File Preview:          1-3 seconds (depends on file size)
Modal Open:            < 100ms
Content Load:          < 1 second
```

### Optimization Tips
- Use CDN URLs for large files
- Keep HTML files under 1MB
- Limit modules to 8-10 per client
- Use reasonable image sizes

---

## 🆘 Support & Troubleshooting

### Common Issues

**"Can't log in"**
- Check credentials
- Clear cache and cookies
- Try different browser

**"Module dropdown shows undefined"**
- Fixed! Uses fallback logic
- Refresh page

**"DOCX file won't preview"**
- Expected! Shows download button
- Local files can't use viewer

**"Welcome popup not showing"**
- Already shown today?
- Clear sessionStorage
- Run: `showGreetingModal()`

**"Review modal not appearing"**
- Shown in last 2 months?
- Less than 30 min since last?
- Run: `showReviewModal()`

**"Night mode not saving"**
- localStorage enabled?
- Not in incognito mode?

### Getting Help

1. Check console for errors (F12 → Console)
2. Review documentation files
3. Test with demo account
4. Clear cache and try again
5. Check network tab for failed requests

---

## 📞 Contact Information

### Business Links
- **Main Site:** https://www.kaylasierra.com
- **Review Page:** https://fera.review/vb2
- **Deep Dive:** https://wix.to/IYtKXqT
- **Benchmark:** https://wix.to/XgXUSVb
- **Coaching:** https://www.kaylasierra.com/pricing-plans

### Support Email
- **Email:** kayla@kaylasierra.com
  (Shown in login page footer)

---

## 🎉 Quick Start Checklist

### First-Time Setup (30 Minutes)
- [ ] Open `index.html`
- [ ] Log in as admin (kayla@kaylasierra.com / admin123)
- [ ] **CHANGE ADMIN PASSWORD**
- [ ] Set global welcome message
- [ ] Upload 1-2 test files
- [ ] Build 1 module with content
- [ ] Create demo client
- [ ] Assign modules to demo client
- [ ] Test as demo client
- [ ] Verify all features work

### Ready to Deploy (When Complete)
- [ ] All modules built
- [ ] All files uploaded
- [ ] Welcome messages set
- [ ] Test clients verified
- [ ] All features tested
- [ ] Go to **Publish tab**
- [ ] Click "Publish"
- [ ] Get live URL
- [ ] Share with real clients!

---

## 🔗 One-Click Access

### Most Used Links
```
Login:              index.html
Admin Dashboard:    admin.html
Module Builder:     module-builder.html
Welcome Messages:   welcome-messages.html
File Manager:       file-upload.html
```

### Most Used Credentials
```
Admin:  kayla@kaylasierra.com / admin123
Demo:   demo@example.com / demo123
```

### Most Used Commands
```javascript
// Test modals
showGreetingModal();
showBenchmarkCallModal();
showReviewModal();

// Clear for retesting
localStorage.clear();
sessionStorage.clear();

// Check session
auth.getSession();
```

---

## 📋 Final Checklist

### ✅ Everything You Need to Know
- [x] Admin credentials
- [x] Demo credentials
- [x] All page URLs
- [x] All external links
- [x] Database tables
- [x] File locations
- [x] Console commands
- [x] Storage keys
- [x] Content types
- [x] Color codes
- [x] API endpoints
- [x] Troubleshooting

---

## 🎯 Your Next Step

**Right now, do this:**

1. Open `index.html` in your browser
2. Log in with: `kayla@kaylasierra.com` / `admin123`
3. Click "Welcome Messages" in sidebar
4. Create your first welcome message
5. Test it by logging in as demo client

**That's it!** You're ready to use your platform.

---

**Access Guide Complete** 🔑  
**All Links Documented** ✅  
**Ready to Start** 🚀

**Start Here:** `index.html`  
**Admin Login:** `kayla@kaylasierra.com` / `admin123`  
**Status:** PRODUCTION READY
