# Debugging Cloudinary Direct Upload Issues

## If Preset is Already Unsigned But Still Getting "Unknown API key" Error

If your preset is set to **Unsigned** but you're still getting the error, check these:

### 1. Verify Environment Variables Are Set

**In Vercel:**
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Check that these are set:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = Your exact cloud name from Cloudinary dashboard
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` = `billboard-ads` (or your preset name)

**Important:** `NEXT_PUBLIC_` variables must be set **before** building. If you add them after deployment, you must **redeploy**.

### 2. Verify Cloud Name is Correct

1. Go to [Cloudinary Dashboard](https://console.cloudinary.com)
2. Your cloud name is shown at the top of the dashboard
3. Make sure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` matches **exactly** (case-sensitive, no spaces)

### 3. Verify Preset Name Matches

1. In Cloudinary Dashboard → Settings → Upload Presets
2. Check the exact name of your preset (e.g., `billboard-ads`)
3. Make sure `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` matches **exactly** (case-sensitive)

### 4. Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
- `Cloudinary upload config:` - This shows what values are being used
- Any error messages with details

### 5. Common Issues

#### Issue: Environment Variable Not Available in Browser
**Symptom:** `cloudName` is `undefined` in console logs

**Fix:**
- Make sure variable name starts with `NEXT_PUBLIC_`
- Redeploy after adding/updating the variable
- Check that variable is set for the correct environment (Production/Preview/Development)

#### Issue: Cloud Name Typo
**Symptom:** Error mentions "Invalid cloud name" or "not found"

**Fix:**
- Copy cloud name directly from Cloudinary dashboard
- Check for typos, extra spaces, or wrong case
- Cloud names are usually lowercase with hyphens (e.g., `my-cloud-name`)

#### Issue: Preset Name Mismatch
**Symptom:** Error says "Invalid upload preset"

**Fix:**
- Preset names are case-sensitive
- Check exact spelling in Cloudinary dashboard
- Make sure preset exists and is enabled

### 6. Test Upload Preset Directly

You can test if your preset works by using Cloudinary's upload widget or curl:

```bash
curl -X POST https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload \
  -F "file=@test.jpg" \
  -F "upload_preset=billboard-ads"
```

Replace:
- `YOUR_CLOUD_NAME` with your actual cloud name
- `billboard-ads` with your preset name
- `test.jpg` with a test image file

If this works, the preset is fine and the issue is with the environment variables.

### 7. Force Rebuild

After setting environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a rebuild

**Why:** `NEXT_PUBLIC_` variables are embedded at build time, so changes require a rebuild.

### 8. Check Network Tab

In browser DevTools → Network tab:
1. Look for the request to `api.cloudinary.com`
2. Check the request URL - does it have the correct cloud name?
3. Check the FormData - does it have the correct `upload_preset`?
4. Check the response - what error does Cloudinary return?

### Quick Checklist

- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set in Vercel
- [ ] Cloud name matches Cloudinary dashboard exactly
- [ ] `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` is set (or using default `billboard-ads`)
- [ ] Preset name matches Cloudinary dashboard exactly (case-sensitive)
- [ ] Preset is set to **Unsigned** mode
- [ ] Application has been **redeployed** after setting variables
- [ ] Checked browser console for detailed error messages
- [ ] Checked Network tab for the actual request/response

### Still Not Working?

1. **Check browser console** - Look for the `Cloudinary upload config:` log
2. **Check Network tab** - See the actual request being sent
3. **Try creating a new preset** with a different name
4. **Verify in Cloudinary dashboard** that uploads are being attempted (check Media Library or Activity logs)

