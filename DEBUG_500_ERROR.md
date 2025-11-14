# Debugging 500 Errors - Step by Step

Since DATABASE_URL is set correctly, let's check what's actually failing.

## Step 1: Check Vercel Function Logs

**This is the most important step!**

1. Go to **Vercel Dashboard** → Your Project
2. Click **Deployments** tab
3. Click on the **latest deployment**
4. Go to **Functions** tab
5. Click on `/api/ads/active` or `/api/ads/submit`
6. Click **Logs** tab
7. Look for error messages

**What to look for:**
- `Cloudinary is not configured` → Missing Cloudinary env vars
- `Database connection failed` → DATABASE_URL issue
- `P1001` → Database connection timeout
- `relation "Ad" does not exist` → Migrations not run
- Any other error message

## Step 2: Verify All Environment Variables

Check these in Vercel → Settings → Environment Variables:

### Required Variables:
- [ ] `DATABASE_URL` - Neon pooled connection string
- [ ] `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Your Cloudinary API key  
- [ ] `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Common Issues:
1. **Variables set but not applied** → Redeploy after adding variables
2. **Wrong environment** → Make sure variables are set for Production
3. **Extra spaces** → Check for leading/trailing spaces in values
4. **Wrong connection string** → Must be pooled connection for serverless

## Step 3: Test Each Service Separately

### Test Database Connection:
```bash
# Set DATABASE_URL
export DATABASE_URL="your-neon-connection-string"

# Test connection
npx prisma db pull
```

### Test Cloudinary:
The improved error handling will now show Cloudinary errors in Vercel logs.

## Step 4: Check Common Issues

### Issue: Cloudinary Not Configured
**Error in logs:** `Cloudinary is not configured`
**Fix:** Add all 3 Cloudinary environment variables in Vercel

### Issue: Database Connection
**Error in logs:** `P1001` or `Can't reach database`
**Fix:** 
- Verify DATABASE_URL format (must start with `postgresql://`)
- Use pooled connection string (with `pgbouncer=true`)
- Check Neon dashboard for connection limits

### Issue: Missing Tables
**Error in logs:** `relation "Ad" does not exist`
**Fix:** Run migrations:
```bash
npx prisma migrate deploy
```

### Issue: Prisma Client Not Generated
**Error in logs:** Prisma client errors
**Fix:** Check build logs - `prisma generate` should run during build

## Step 5: Check Build Logs

1. Go to Vercel → Deployments → Latest
2. Check **Build Logs** for:
   - Prisma generation errors
   - Missing dependencies
   - TypeScript errors

## What the Improved Code Does

The updated code now:
- ✅ Logs detailed error information to Vercel logs
- ✅ Shows error codes (P1001, etc.)
- ✅ Checks for Cloudinary configuration
- ✅ Checks for database connection issues
- ✅ Returns more specific error messages

**After redeploying, check Vercel function logs to see the exact error!**

