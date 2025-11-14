# Troubleshooting "Internal Server Error" on Ad Upload

## Common Causes

### 1. Cloudinary Environment Variables Not Set in Vercel

**Symptoms:** "Internal server error" when uploading ads

**Solution:**
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify these three variables are set:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Make sure they're set for **Production**, **Preview**, and **Development**
4. **Redeploy** after adding/updating variables

**How to get Cloudinary credentials:**
1. Go to [Cloudinary Dashboard](https://console.cloudinary.com)
2. Your credentials are shown on the main dashboard:
   - **Cloud name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Reveal" to see it)

### 2. Check Vercel Function Logs

**To see the actual error:**
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Go to **Functions** tab
4. Click on `/api/ads/submit`
5. Check **Logs** for the actual error message

**Common errors you might see:**
- `Cloudinary credentials are not configured` → Missing env vars
- `Cloudinary upload failed: Invalid API key` → Wrong API key
- `Cloudinary upload failed: File too large` → File exceeds Cloudinary limits (10MB images, 100MB videos on free tier)

### 3. Test Cloudinary Connection

You can test if Cloudinary is working by checking the logs. The improved error handling will now show:
- In **development**: Full error message
- In **production**: Generic "Internal server error" (check Vercel logs for details)

### 4. Verify File Size

**Cloudinary Free Tier Limits:**
- Images: 10MB max
- Videos: 100MB max

If your file is too large, you'll get an error. Check the file size before uploading.

### 5. Database Connection Issues

If Cloudinary works but database fails:
1. Check `DATABASE_URL` is set in Vercel
2. Verify it's the **pooled connection string** (with `pgbouncer=true`)
3. Check Neon dashboard for connection issues

---

## Quick Fix Checklist

- [ ] Cloudinary credentials set in Vercel (all 3 variables)
- [ ] Variables set for Production, Preview, and Development
- [ ] Redeployed after setting variables
- [ ] Checked Vercel function logs for actual error
- [ ] File size within limits (10MB images, 100MB videos)
- [ ] DATABASE_URL is set correctly

---

## Testing Locally

To test uploads locally:

1. Create `.env.local` file:
```env
DATABASE_URL=your-neon-connection-string
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

2. Run dev server:
```bash
npm run dev
```

3. Try uploading an ad - you should see detailed error messages in the console

---

## Still Having Issues?

1. **Check Vercel Logs** - The actual error will be in the function logs
2. **Verify Cloudinary Account** - Make sure your Cloudinary account is active
3. **Check API Limits** - Free tier has rate limits
4. **Test with Small File** - Try uploading a small image first (under 1MB)

The improved error handling will now show more details in development mode and log everything to Vercel function logs.

