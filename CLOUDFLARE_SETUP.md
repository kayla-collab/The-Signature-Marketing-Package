# Cloudflare Deployment Guide

Your application has been successfully converted to support Cloudflare Pages + Cloudflare D1 (Serverless Database).

To deploy this live, you need to follow these exact steps in your terminal (or local machine) because these commands require your Cloudflare login.

### **Step 1: Install Wrangler**
If you haven't already:
```bash
npm install -g wrangler
```

### **Step 2: Login to Cloudflare**
```bash
wrangler login
```

### **Step 3: Create the D1 Database**
Run this command to create your database on Cloudflare:
```bash
wrangler d1 create tsmp-db
```

**⚠️ IMPORTANT:**
The command output will give you a `database_id` (e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
You MUST copy this ID and paste it into your `wrangler.toml` file where it says `YOUR_DATABASE_ID_HERE`.

### **Step 4: Initialize the Database**
Upload your schema and existing data (I have already exported everything for you into `migration.sql`):

```bash
wrangler d1 execute tsmp-db --file=migration.sql --remote
```

### **Step 5: Deploy**
Now you can deploy your application:

```bash
npx wrangler pages deploy .
```

---

### ** Troubleshooting**
- **If you get "Too Large" errors during deployment:**
  Cloudflare Pages has a file limit. If your `migration.sql` is massive, you might need to split it, but it should be fine for this size.
  
- **If the app loads but data is missing:**
  Ensure you ran Step 4 (execute migration.sql) with the `--remote` flag.

- **Local Development:**
  To run this locally using Cloudflare's simulator (instead of `node server.js`):
  ```bash
  npx wrangler pages dev . --d1 DB=tsmp-db
  ```
