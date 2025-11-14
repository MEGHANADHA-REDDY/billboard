# Connecting Database to Vercel - Complete Guide

## Step 1: Set Up a Cloud PostgreSQL Database

Choose one of these providers (all work great with Vercel):

### Option A: Vercel Postgres (Recommended - Easiest)
1. Go to your Vercel project dashboard
2. Click on **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Choose a plan (Hobby plan is free for small projects)
5. Vercel will automatically create the database and provide the connection string

### Option B: Neon (Free Tier Available)
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:password@host/database?sslmode=require`)

### Option C: Supabase (Free Tier Available)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string from **Connection string** section

### Option D: Railway (Free Trial)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string from the service settings

### Option E: Render (Free Tier Available)
1. Go to [render.com](https://render.com)
2. Create a new PostgreSQL database
3. Copy the connection string from the database dashboard

---

## Step 2: Add Environment Variable to Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Click **Add New**
5. Add the following:
   - **Key**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string (from Step 1)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

**Important**: The connection string format should be:
```
postgresql://username:password@host:port/database?sslmode=require
```

For most cloud providers, you'll need to add `?sslmode=require` or `?sslmode=prefer` at the end.

---

## Step 3: Run Database Migrations

You have two options:

### Option A: Automatic Migration (Recommended)
I've updated your `vercel.json` to run migrations automatically after build. Just redeploy!

### Option B: Manual Migration
Run this command locally (make sure your local `.env` has the same `DATABASE_URL`):
```bash
npx prisma migrate deploy
```

Or use the migration script:
```bash
node scripts/migrate.js
```

---

## Step 4: Verify Connection

After deployment, check your Vercel function logs:
1. Go to Vercel dashboard → Your project → **Deployments**
2. Click on the latest deployment
3. Check **Function Logs** for any database connection errors

---

## Step 5: Test Your Application

1. Visit your deployed Vercel URL
2. Try registering a new user
3. Try creating an ad
4. Check if data is being saved to your database

---

## Troubleshooting

### Connection Timeout
- Make sure your database allows connections from Vercel's IPs
- Most cloud providers allow all IPs by default, but check firewall settings

### SSL Required Error
- Add `?sslmode=require` to your connection string
- Some providers require `?sslmode=prefer`

### Migration Errors
- Make sure migrations are up to date: `npx prisma migrate deploy`
- Check that your database is empty or matches the migration state

### Connection Pool Exhaustion
- Already fixed! We're using the Prisma singleton pattern in `src/lib/prisma.ts`

---

## Quick Reference: Connection String Examples

**Neon:**
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Supabase:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres?sslmode=require
```

**Railway:**
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Render:**
```
postgresql://user:password@dpg-xxx-xxx.region.render.com/dbname?sslmode=require
```

---

## Next Steps

After database is connected:
1. ✅ Your app will be able to store users and ads
2. ⚠️ File uploads still need cloud storage (Vercel Blob, S3, Cloudinary)
3. ✅ All API routes will work with the database

Need help? Check Vercel logs or database provider documentation.

