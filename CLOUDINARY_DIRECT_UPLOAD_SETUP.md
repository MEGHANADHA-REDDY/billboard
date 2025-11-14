# Cloudinary Direct Upload Setup Guide

## Overview

Files are now uploaded **directly from the browser to Cloudinary**, bypassing Vercel's 4.5MB limit. This allows uploads up to:
- **Videos:** 100MB (Cloudinary free tier)
- **Images:** 20MB (Cloudinary free tier)

## Setup Steps

### 1. Create Unsigned Upload Preset in Cloudinary

1. Go to [Cloudinary Dashboard](https://console.cloudinary.com)
2. Navigate to **Settings** → **Upload** (or go directly to Upload Presets)
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name:** `billboard-ads` (or any name you prefer)
   - **Signing mode:** Select **Unsigned** (this is important!)
   - **Folder:** `billboard-ads` (optional, but recommended)
   - **Resource type:** `Auto` (to support both images and videos)
   - **Use filename:** ✅ Enabled
   - **Unique filename:** ✅ Enabled
   - **Overwrite:** ❌ Disabled (recommended)
5. Click **Save**

### 2. Set Environment Variables

Add these environment variables to your **Vercel project**:

#### Required:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
  - Example: `your-cloud-name`
  - This is public (safe to expose in frontend)

#### Optional:
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` - Your upload preset name
  - Default: `billboard-ads` (if not set, it will use this default)
  - Example: `billboard-ads`
  - This is public (safe to expose in frontend)

#### How to Set in Vercel:
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - Key: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - Value: Your Cloudinary cloud name (e.g., `your-cloud-name`)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
3. Add (optional):
   - Key: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - Value: Your preset name (e.g., `billboard-ads`)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
4. **Redeploy** your application

### 3. Local Development Setup

Add to your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=billboard-ads
```

**Note:** These are `NEXT_PUBLIC_` variables, so they're safe to commit to git (they're exposed to the browser anyway).

## How It Works

1. **User selects file** in the dashboard
2. **File uploads directly to Cloudinary** from the browser (bypasses Vercel)
3. **Cloudinary returns a secure URL**
4. **Frontend sends only the URL** to your API (no file data)
5. **API saves the URL** to the database

## Benefits

✅ **No Vercel size limits** - Files go directly to Cloudinary  
✅ **Faster uploads** - Direct connection to Cloudinary  
✅ **Progress tracking** - Real-time upload progress  
✅ **Less server load** - Vercel doesn't handle file uploads  
✅ **Better user experience** - No 4.5MB limit errors  

## Troubleshooting

### Error: "Upload preset is required"
- Make sure you created an **unsigned** upload preset in Cloudinary
- Set `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` environment variable
- Or use the default name `billboard-ads`

### Error: "Cloudinary cloud name is not configured"
- Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in Vercel environment variables
- Make sure to redeploy after adding the variable

### Error: "Invalid media URL. Must be a Cloudinary URL"
- This means the file didn't upload to Cloudinary successfully
- Check browser console for Cloudinary upload errors
- Verify your upload preset is set to **Unsigned**

### Upload fails silently
- Check browser console for errors
- Verify Cloudinary credentials are correct
- Make sure the upload preset name matches your environment variable

## Security Notes

- ✅ **Unsigned upload presets are safe** - They only allow uploads, not deletions or modifications
- ✅ **Cloudinary URLs are public** - But you can add access controls if needed
- ✅ **No API secrets exposed** - Only cloud name and preset name (both are public)

## Testing

1. Go to the advertiser dashboard
2. Select a file (try a 10MB video)
3. You should see upload progress
4. File should upload successfully
5. Ad should be created with the Cloudinary URL

## Cloudinary Limits

**Free Tier:**
- Images: 20MB max
- Videos: 100MB max
- Storage: 25GB
- Bandwidth: 25GB/month

**Paid Tier:**
- Images: 20MB max
- Videos: 500MB max
- Storage: Custom
- Bandwidth: Custom

Your current setup supports up to **100MB videos** on the free tier!

