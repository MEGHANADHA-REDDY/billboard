# Fix: Browser Zoom and Video Upload Limit

## Issues Fixed

### 1. Browser Zoom Issue ✅
**Problem:** When scrolling/zooming on the grid, the browser was also zooming in/out.

**Solution:**
- Added non-passive wheel event listeners to both `src/app/page.tsx` and `src/components/GridSelector.tsx`
- The event listeners use `{ passive: false }` to allow `preventDefault()` to work
- Added CSS properties `touchAction: 'none'` and `overscrollBehavior: 'none'` to prevent browser zoom
- Removed React's `onWheel` prop and replaced with native event listeners for better control

**Files Changed:**
- `src/app/page.tsx` - Added non-passive wheel event listener
- `src/components/GridSelector.tsx` - Added non-passive wheel event listener

### 2. Video Upload Limit (25MB) ✅
**Problem:** Video uploads were failing with "R token error" due to 4.5MB default limit.

**Solution:**
- Updated `next.config.js` to set `serverActions.bodySizeLimit` to `25mb`
- Added file size validation in `src/app/api/ads/submit/route.ts` (validates up to 25MB)
- Added `maxDuration: 30` to the API route for longer upload times
- Configured `vercel.json` with `maxDuration: 30` for API functions

**Files Changed:**
- `next.config.js` - Added `serverActions.bodySizeLimit: '25mb'`
- `src/app/api/ads/submit/route.ts` - Added file size validation and route config
- `vercel.json` - Already has `maxDuration: 30` configured

## Important Notes

### Vercel Body Size Limits

**⚠️ Important:** Vercel has different body size limits based on your plan:

- **Hobby Plan:** 4.5MB limit (default)
- **Pro Plan:** 4.5MB limit (default)
- **Enterprise Plan:** Custom limits available

**For 25MB uploads on Vercel, you have two options:**

1. **Upgrade to Enterprise Plan** (supports custom body size limits)
2. **Use Chunked Upload** (split large files into smaller chunks on the client side)

### Current Implementation

The current implementation:
- ✅ Validates file size on the server (rejects files > 25MB)
- ✅ Configures Next.js to accept up to 25MB
- ⚠️ **May still fail on Vercel Hobby/Pro plans** due to Vercel's 4.5MB limit

### Testing

To test the fixes:

1. **Browser Zoom:**
   - Open the grid page
   - Scroll with mouse wheel or trackpad
   - Browser should NOT zoom, only the grid should zoom

2. **File Upload:**
   - Try uploading a video file (5MB, 10MB, 20MB, 25MB)
   - Files > 25MB should show an error message
   - Files ≤ 25MB should upload successfully (if on Enterprise plan)

### If Uploads Still Fail on Vercel

If you're on Vercel Hobby/Pro and uploads still fail, consider:

1. **Implementing chunked uploads** - Split files into 4MB chunks on client
2. **Using direct Cloudinary upload** - Upload directly from browser to Cloudinary (bypasses Vercel limit)
3. **Upgrading to Enterprise plan** - Supports custom body size limits

## Cloudinary Limits

Cloudinary supports:
- **Images:** Up to 10MB (free), 20MB (paid)
- **Videos:** Up to 100MB (free), 500MB (paid)

So Cloudinary can handle 25MB videos without issues.

