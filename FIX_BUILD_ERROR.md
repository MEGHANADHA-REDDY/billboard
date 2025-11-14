# Fix: DATABASE_URL Error During Build

## Problem
You're seeing this error:
```
Error: the URL must start with the protocol `postgresql://` or `postgres://`
```

This means `DATABASE_URL` is either:
- ❌ Not set in Vercel environment variables
- ❌ Set but empty or has incorrect format
- ❌ Has extra whitespace or characters

## Solution

### Step 1: Set DATABASE_URL in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** tab
3. Click **Environment Variables** in left sidebar
4. Click **Add New**
5. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

### Step 2: Verify Connection String Format

Your connection string must start with `postgresql://` or `postgres://`

**Correct formats:**
```
postgresql://user:password@host:port/database?sslmode=require
postgres://user:password@host:port/database?sslmode=require
```

**Common mistakes:**
- ❌ Missing `postgresql://` prefix
- ❌ Extra spaces before/after
- ❌ Missing `?sslmode=require` (required for most cloud databases)

### Step 3: Redeploy

After setting `DATABASE_URL`:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger deployment

## Quick Test

To verify your connection string format is correct, you can test it locally:

```bash
# Set it temporarily
export DATABASE_URL="your-connection-string-here"

# Test Prisma connection
npx prisma db pull
```

If this works, your connection string is correct!

## Still Having Issues?

1. **Check Vercel logs** - Look for the exact error message
2. **Verify database is accessible** - Make sure your database allows connections
3. **Check firewall settings** - Some databases require IP whitelisting
4. **Try connection string without SSL** - Some providers use `?sslmode=prefer` instead

## Updated Build Process

I've updated the build script to handle missing `DATABASE_URL` more gracefully:
- ✅ Build will still work if `DATABASE_URL` is not set (skips migrations)
- ✅ Migrations only run if `DATABASE_URL` is properly set
- ✅ Clear error messages if connection fails

But you still need `DATABASE_URL` set for the app to work properly!

