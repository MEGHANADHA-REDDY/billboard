# Fixing 500 Internal Server Error

## Common Causes

### 1. DATABASE_URL Not Set in Vercel

**Symptoms:** 500 error on `/api/ads/active` and `/api/ads/submit`

**Solution:**
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify `DATABASE_URL` is set:
   - Should be your Neon pooled connection string
   - Format: `postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require&pgbouncer=true`
3. Make sure it's set for **Production**, **Preview**, and **Development**
4. **Redeploy** after adding/updating

### 2. Check Vercel Function Logs

**To see the actual error:**
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Go to **Functions** tab
4. Click on the failing route (e.g., `/api/ads/active`)
5. Check **Logs** for the actual error message

**Common errors you might see:**
- `DATABASE_URL is not set` → Add DATABASE_URL to Vercel
- `Can't reach database` → Check connection string format
- `P1001` → Database connection timeout
- `relation "Ad" does not exist` → Run migrations

### 3. Database Connection Issues

**If DATABASE_URL is set but still failing:**
- Verify connection string format (must start with `postgresql://`)
- Check if using **pooled connection** (with `pgbouncer=true`) for serverless
- Verify Neon database is running and accessible
- Check Neon dashboard for connection limits

### 4. Missing Migrations

**If you see "relation does not exist" errors:**
```bash
# Run migrations
npx prisma migrate deploy
```

Or use the direct connection (not pooled) for migrations:
```bash
# Set direct connection temporarily
export DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Run migrations
npx prisma migrate deploy
```

### 5. Prisma Client Not Generated

**If you see Prisma client errors:**
- The build should generate it automatically
- Check build logs for Prisma generation errors
- Verify `prisma generate` runs during build

---

## Quick Checklist

- [ ] `DATABASE_URL` set in Vercel environment variables
- [ ] Using **pooled connection string** (with `pgbouncer=true`)
- [ ] Variables set for Production, Preview, and Development
- [ ] Redeployed after setting variables
- [ ] Checked Vercel function logs for actual error
- [ ] Database migrations have been run
- [ ] Neon database is accessible

---

## Testing Locally

To test database connection locally:

1. Create `.env.local`:
```env
DATABASE_URL=your-neon-connection-string
```

2. Test connection:
```bash
npx prisma db pull
```

3. Run dev server:
```bash
npm run dev
```

4. Check console for detailed error messages

---

## Next Steps

After fixing the issue:
1. Check Vercel function logs to see the exact error
2. The improved error handling will now show more details
3. Common fixes:
   - Add missing `DATABASE_URL` in Vercel
   - Use pooled connection string for serverless
   - Run migrations if tables don't exist

The improved error handling will help identify the exact issue!

