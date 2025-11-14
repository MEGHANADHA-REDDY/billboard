# Production Deployment Guide
## Vercel + Neon + Cloudinary

This guide will walk you through deploying your Billboard project to production.

---

## Prerequisites

- GitHub account (for Vercel integration)
- Neon account (free tier available)
- Cloudinary account (free tier available)
- Vercel account (free tier available)

---

## Step 1: Set Up Neon Database

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### 1.2 Get Connection Strings
1. In your Neon project dashboard, go to **Connection Details**
2. You'll see two connection strings:
   - **Direct connection** (for migrations)
   - **Pooled connection** (for serverless - **USE THIS ONE**)

3. Copy the **Pooled connection string** (it ends with `?sslmode=require&pgbouncer=true`)
   - Format: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require&pgbouncer=true`

### 1.3 Run Migrations Locally (First Time)
```bash
# Set your direct connection string (not pooled) for migrations
export DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Run migrations
npx prisma migrate deploy
```

**Note:** Use the **direct connection** (without `pgbouncer=true`) for migrations, but use the **pooled connection** in Vercel.

---

## Step 2: Set Up Cloudinary

### 2.1 Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. You'll be taken to your dashboard

### 2.2 Get API Credentials
1. In Cloudinary dashboard, you'll see:
   - **Cloud name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

2. Copy these three values (you'll need them for Vercel)

---

## Step 3: Deploy to Vercel

### 3.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3.2 Configure Environment Variables
Before deploying, add all environment variables:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

#### Database (Neon)
- **Key:** `DATABASE_URL`
- **Value:** Your Neon **pooled connection string** (with `pgbouncer=true`)
- **Environment:** Production, Preview, Development

#### Cloudinary
- **Key:** `CLOUDINARY_CLOUD_NAME`
- **Value:** Your Cloudinary cloud name
- **Environment:** Production, Preview, Development

- **Key:** `CLOUDINARY_API_KEY`
- **Value:** Your Cloudinary API key
- **Environment:** Production, Preview, Development

- **Key:** `CLOUDINARY_API_SECRET`
- **Value:** Your Cloudinary API secret
- **Environment:** Production, Preview, Development

#### Optional
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production only

### 3.3 Configure Build Settings
Vercel should auto-detect these, but verify:

- **Framework Preset:** Next.js
- **Build Command:** `node scripts/build.js` (or `npm run build`)
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 3.4 Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

---

## Step 4: Verify Deployment

### 4.1 Check Build Logs
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check **Build Logs** for any errors

### 4.2 Test Database Connection
1. Visit your deployed URL
2. Try registering a new user
3. Check Vercel **Function Logs** for database errors

### 4.3 Test File Upload
1. Log in to your app
2. Try uploading an ad (image or video)
3. Verify the file appears on Cloudinary dashboard
4. Check that the ad displays correctly on the grid

---

## Step 5: Post-Deployment

### 5.1 Run Migrations (if needed)
If migrations didn't run during build:

```bash
# Set DATABASE_URL to your direct connection (not pooled)
export DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Run migrations
npx prisma migrate deploy
```

Or use Vercel CLI:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### 5.2 Monitor
- Check **Vercel Analytics** for performance
- Monitor **Neon Dashboard** for database usage
- Check **Cloudinary Dashboard** for storage usage

---

## Troubleshooting

### Database Connection Issues

**Error:** "Connection timeout" or "Connection pool exhausted"
- **Solution:** Make sure you're using the **pooled connection string** (with `pgbouncer=true`) in Vercel
- **Solution:** Check Neon dashboard for connection limits

**Error:** "SSL required"
- **Solution:** Ensure connection string includes `?sslmode=require`

### Cloudinary Issues

**Error:** "Cloudinary is not configured"
- **Solution:** Verify all three Cloudinary environment variables are set in Vercel
- **Solution:** Check that values don't have extra spaces

**Error:** "Upload failed"
- **Solution:** Check Cloudinary dashboard for API limits
- **Solution:** Verify file size limits (free tier: 10MB for images, 100MB for videos)

### Build Issues

**Error:** "Prisma Client generation failed"
- **Solution:** Ensure `DATABASE_URL` is set correctly in Vercel
- **Solution:** Check build logs for specific Prisma errors

**Error:** "Module not found: cloudinary"
- **Solution:** Run `npm install` locally and push `package-lock.json`
- **Solution:** Check that `cloudinary` is in `package.json` dependencies

---

## Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | Neon pooled connection string | `postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require&pgbouncer=true` |
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | ✅ Yes | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Cloudinary API secret | `abcdefghijklmnopqrstuvwxyz` |
| `NODE_ENV` | ⚠️ Optional | Environment mode | `production` |

---

## Important Notes

1. **Connection Pooling:** Always use Neon's pooled connection string (`pgbouncer=true`) in Vercel for serverless functions
2. **Migrations:** Use direct connection (without `pgbouncer=true`) for running migrations
3. **File Storage:** All uploaded files are stored in Cloudinary, not on Vercel's filesystem
4. **Security:** Never commit `.env` files or expose API secrets
5. **Free Tiers:**
   - Neon: 0.5GB storage, 1 project
   - Cloudinary: 25GB storage, 25GB bandwidth/month
   - Vercel: Unlimited projects, 100GB bandwidth/month

---

## Next Steps

- Set up custom domain in Vercel
- Configure Cloudinary transformations for optimized images
- Set up monitoring and alerts
- Configure backup strategy for Neon database

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Prisma Docs:** https://www.prisma.io/docs

