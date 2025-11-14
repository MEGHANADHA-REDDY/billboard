# Fix: "Unknown API key" Error in Cloudinary Upload

## Problem
You're getting the error: **"Failed to upload file to Cloudinary: Unknown API key"**

## Root Cause
This error occurs when your **upload preset is set to "Signed"** instead of **"Unsigned"**. Signed presets require an API key and signature, but we're using unsigned presets for direct browser uploads.

## Solution

### Step 1: Check Your Upload Preset in Cloudinary

1. Go to [Cloudinary Dashboard](https://console.cloudinary.com)
2. Navigate to **Settings** → **Upload** → **Upload Presets**
3. Find your preset (e.g., `billboard-ads`)
4. Click on it to edit

### Step 2: Change to Unsigned Mode

1. Look for **"Signing mode"** or **"Sign upload"** setting
2. Change it to **"Unsigned"** (not "Signed")
3. Click **Save**

### Step 3: Verify Settings

Your upload preset should have:
- ✅ **Signing mode:** `Unsigned`
- ✅ **Folder:** `billboard-ads` (optional)
- ✅ **Resource type:** `Auto` (for images and videos)
- ✅ **Use filename:** Enabled
- ✅ **Unique filename:** Enabled

### Step 4: Verify Environment Variables

Make sure these are set in **Vercel**:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = Your cloud name (e.g., `your-cloud-name`)
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` = Your preset name (e.g., `billboard-ads`)
3. **Redeploy** after making changes

### Step 5: Test Again

Try uploading a file again. The error should be resolved.

## Alternative: Create a New Unsigned Preset

If you can't find or edit your existing preset:

1. Go to Cloudinary Dashboard → **Settings** → **Upload**
2. Click **Add upload preset**
3. Configure:
   - **Preset name:** `billboard-ads-unsigned` (or any name)
   - **Signing mode:** **Unsigned** ⚠️ (This is critical!)
   - **Folder:** `billboard-ads`
   - **Resource type:** `Auto`
   - **Use filename:** ✅ Enabled
   - **Unique filename:** ✅ Enabled
4. Click **Save**
5. Update `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` in Vercel to match the new preset name
6. Redeploy

## Quick Checklist

- [ ] Upload preset is set to **"Unsigned"** (not "Signed")
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set in Vercel
- [ ] `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` matches the preset name in Cloudinary
- [ ] Application has been redeployed after setting environment variables
- [ ] Preset name in Cloudinary matches the environment variable

## Why Unsigned?

**Unsigned upload presets** are required for direct browser uploads because:
- ✅ No API key needed (safe to expose in frontend)
- ✅ No signature generation required
- ✅ Simpler implementation
- ✅ Still secure (preset can be restricted to specific folders/types)

**Signed upload presets** require:
- ❌ API key (should not be exposed in frontend)
- ❌ Signature generation (requires server-side code)
- ❌ More complex setup

## Still Having Issues?

1. **Check browser console** for the full error message
2. **Verify cloud name** is correct (no typos)
3. **Verify preset name** matches exactly (case-sensitive)
4. **Check Cloudinary dashboard** to see if uploads are being attempted
5. **Try creating a new unsigned preset** with a different name

## Common Mistakes

❌ **Wrong:** Preset set to "Signed"  
✅ **Correct:** Preset set to "Unsigned"

❌ **Wrong:** Using API key in frontend code  
✅ **Correct:** Using unsigned preset (no API key needed)

❌ **Wrong:** Preset name doesn't match environment variable  
✅ **Correct:** Preset name matches `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

