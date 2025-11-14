# Solutions for Large File Uploads (25MB) on Vercel

## Problem
Vercel Hobby/Pro plans have a **4.5MB body size limit** for serverless functions, but you need to upload files up to **25MB**.

## Solutions (Ranked by Ease of Implementation)

### ✅ Solution 1: Direct Cloudinary Upload from Browser (RECOMMENDED)
**Best option** - Uploads directly from browser to Cloudinary, bypassing Vercel entirely.

**Pros:**
- ✅ No Vercel size limits
- ✅ Faster uploads (direct to Cloudinary)
- ✅ Less server load
- ✅ Cloudinary supports up to 100MB videos (free plan)
- ✅ Easy to implement

**Cons:**
- ⚠️ Requires Cloudinary's unsigned upload preset (or signed upload with frontend key)

**Implementation:**
1. Create an unsigned upload preset in Cloudinary dashboard
2. Upload directly from browser using Cloudinary's upload widget or SDK
3. Send only the Cloudinary URL to your API

**Code Example:**
```typescript
// Frontend: Direct upload to Cloudinary
import { v2 as cloudinary } from 'cloudinary';

const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_unsigned_preset_name');
  formData.append('folder', 'billboard-ads');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: 'POST',
      body: formData
    }
  );
  
  const data = await response.json();
  return data.secure_url; // Return URL to send to your API
};
```

---

### Solution 2: Chunked Uploads
Split large files into smaller chunks (e.g., 4MB each) and upload them separately.

**Pros:**
- ✅ Works with Vercel's 4.5MB limit
- ✅ Can resume failed uploads
- ✅ Progress tracking per chunk

**Cons:**
- ⚠️ More complex implementation
- ⚠️ Requires backend to reassemble chunks
- ⚠️ More API calls

**Implementation:**
1. Split file into 4MB chunks on client
2. Upload each chunk to your API
3. Server stores chunks temporarily
4. When all chunks received, reassemble and upload to Cloudinary
5. Clean up temporary chunks

---

### Solution 3: Upgrade to Vercel Enterprise
**Pros:**
- ✅ Custom body size limits (can set to 25MB+)
- ✅ Better performance
- ✅ Priority support

**Cons:**
- ❌ Expensive (Enterprise pricing)
- ❌ May not be worth it for this feature alone

---

### Solution 4: Use a Separate Upload Service
Use services like:
- **Uploadcare** - Direct browser uploads
- **Filestack** - File upload API
- **AWS S3** - Direct browser uploads with presigned URLs

**Pros:**
- ✅ No Vercel limits
- ✅ Professional upload handling
- ✅ Built-in progress tracking

**Cons:**
- ⚠️ Additional service cost
- ⚠️ More setup required

---

### Solution 5: Self-Hosted Upload Endpoint
Deploy a separate Node.js server (not on Vercel) just for file uploads.

**Pros:**
- ✅ Full control over limits
- ✅ Can handle any file size

**Cons:**
- ❌ Additional infrastructure to maintain
- ❌ Extra hosting costs
- ❌ More complex architecture

---

## Recommended Implementation: Direct Cloudinary Upload

I recommend **Solution 1** (Direct Cloudinary Upload) because:
1. ✅ Easiest to implement
2. ✅ No additional costs
3. ✅ Best performance
4. ✅ Already using Cloudinary

### Steps to Implement:

1. **Create Unsigned Upload Preset in Cloudinary:**
   - Go to Cloudinary Dashboard → Settings → Upload
   - Create new upload preset
   - Set it as "Unsigned"
   - Set folder: `billboard-ads`
   - Set resource type: `auto` (for images and videos)

2. **Update Frontend:**
   - Add Cloudinary upload function
   - Upload file directly to Cloudinary
   - Get the secure URL
   - Send only the URL to your API (no file data)

3. **Update API Route:**
   - Remove file upload handling
   - Accept `mediaUrl` instead of `file`
   - Validate that URL is from Cloudinary

Would you like me to implement Solution 1 (Direct Cloudinary Upload)?

