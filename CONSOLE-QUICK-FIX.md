# ⚡ ADMIN LOGIN - CONSOLE FIX (Use This Instead!)

## 🚨 THE QUICK FIX

Since `quick-init.html` isn't published yet, use this method instead:

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Open the Login Page
Open this URL in your browser:
```
https://bd626c36-be0c-4fec-8c1f-d6503f31da63.vip.gensparksite.com/index.html
```

### Step 2: Open Browser Console
Press **F12** on your keyboard (or right-click → "Inspect" → "Console" tab)

### Step 3: Copy & Paste This Code

Copy the ENTIRE code block below and paste it into the console, then press **Enter**:

```javascript
async function initDatabase() {
    console.log('🚀 Starting database initialization...');
    
    try {
        // Create admin user
        console.log('Creating admin user...');
        const adminResponse = await fetch('tables/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'kayla@kaylasierra.com',
                password_hash: 'admin123',
                full_name: 'Kayla Sierra',
                role: 'admin',
                is_active: true,
                access_expires: null
            })
        });
        
        if (!adminResponse.ok) {
            const errorText = await adminResponse.text();
            throw new Error('Failed to create admin: ' + errorText);
        }
        
        console.log('✅ Admin user created!');
        
        // Create default modules
        console.log('Creating default modules...');
        const modules = [
            { 
                title: 'YouTube Content Strategy', 
                description: 'Complete YouTube execution assets including video scripts, posting calendar, optimization checklists, and analytics guides',
                order_index: 1, 
                icon: '' 
            },
            { 
                title: 'Instagram Marketing', 
                description: 'Instagram execution assets with posting calendar, carousel templates, caption library, and engagement strategies',
                order_index: 2, 
                icon: '' 
            },
            { 
                title: 'LinkedIn Networking', 
                description: 'LinkedIn sponsorship assets including outreach sequences, pitch templates, and partnership strategies',
                order_index: 3, 
                icon: '' 
            },
            { 
                title: 'Campus Partnerships', 
                description: 'Campus club partnership assets with outreach templates, workshop materials, and follow-up sequences',
                order_index: 4, 
                icon: '' 
            },
            { 
                title: 'Affiliate Marketing', 
                description: 'Complete affiliate program guide with recruitment templates, onboarding packages, and tracking systems',
                order_index: 5, 
                icon: '' 
            },
            { 
                title: 'Branding & Design', 
                description: 'Branding and design assets including color palettes, Canva templates, and social media graphics',
                order_index: 6, 
                icon: '' 
            },
            { 
                title: 'Strategy & Operations', 
                description: 'Strategy and operations resources with implementation timelines, decision frameworks, and planning templates',
                order_index: 7, 
                icon: '' 
            },
            { 
                title: 'Personal Consultation', 
                description: 'One-on-one coaching access with strategy calls and email support',
                order_index: 8, 
                icon: '' 
            }
        ];
        
        for (const module of modules) {
            await fetch('tables/modules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(module)
            });
            console.log('✅ Created module: ' + module.title);
        }
        
        console.log('✅ ALL DONE!');
        alert('✅ SUCCESS! You can now log in with:\n\nEmail: kayla@kaylasierra.com\nPassword: admin123');
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error: ' + error.message);
    }
}

initDatabase();
```

### Step 4: Wait for Success

You'll see in the console:
```
🚀 Starting database initialization...
Creating admin user...
✅ Admin user created!
Creating default modules...
✅ Created module: YouTube Content Strategy
✅ Created module: Instagram Marketing
... (continues for all 8 modules)
✅ ALL DONE!
```

And a popup will appear saying:
```
✅ SUCCESS! You can now log in with:

Email: kayla@kaylasierra.com
Password: admin123
```

### Step 5: Log In

1. Close the console (press F12 again)
2. Refresh the page (F5)
3. Enter:
   - Email: `kayla@kaylasierra.com`
   - Password: `admin123`
4. Click "Sign In"

**You should now be logged in! ✅**

---

## 🎯 WHAT THIS DOES

This script:
- ✅ Creates your admin account
- ✅ Sets up 8 default modules
- ✅ Prepares the database for content

---

## 🆘 TROUBLESHOOTING

### "User already exists" error
**Good news!** This means the admin user was already created. Just try logging in with:
- Email: kayla@kaylasierra.com
- Password: admin123

### "Table doesn't exist" error
**Problem:** The backend database tables haven't been created yet.
**Solution:** Contact support - this is a backend configuration issue.

### "Failed to fetch" error
**Problem:** Can't connect to the API
**Solution:** 
1. Check your internet connection
2. Make sure you're on the published URL (not localhost)
3. Try refreshing the page

---

## 📞 STILL NOT WORKING?

**Email:** kayla@kaylasierra.com

Include:
- Screenshot of the console after running the code
- Any error messages you see
- What browser you're using

---

## ✅ ONCE YOU'RE LOGGED IN

Next step: Populate the module content!

Unfortunately, `populate-modules.html` also needs to be published. So I'll create a console version for that too.

**Let me know once you're logged in and I'll give you the next script!**

---

© 2025 Kayla Sierra Consulting
