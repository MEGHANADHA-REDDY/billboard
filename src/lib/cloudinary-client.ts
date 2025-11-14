/**
 * Client-side Cloudinary upload utility
 * Uploads files directly from browser to Cloudinary, bypassing Vercel's 4.5MB limit
 */

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
}

/**
 * Upload a file directly to Cloudinary from the browser
 * @param file - File to upload
 * @param uploadPreset - Cloudinary unsigned upload preset name
 * @param folder - Optional folder path in Cloudinary
 * @param onProgress - Optional progress callback (0-100)
 * @returns Cloudinary upload result
 */
export async function uploadToCloudinaryDirect(
  file: File,
  uploadPreset: string,
  folder: string = 'billboard-ads',
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  // Get Cloudinary cloud name from environment (should be in NEXT_PUBLIC_ env var)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.error('Cloudinary configuration check:', {
      cloudName: cloudName || 'NOT SET',
      uploadPreset,
      hasEnvVar: typeof process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== 'undefined',
    });
    throw new Error('Cloudinary cloud name is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable in Vercel and redeploy.');
  }

  if (!uploadPreset) {
    throw new Error('Upload preset is required. Please create an unsigned upload preset in Cloudinary dashboard.');
  }

  // Log configuration for debugging (cloud name is safe to log, it's public)
  console.log('Cloudinary upload config:', {
    cloudName,
    uploadPreset,
    folder,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  // Create FormData for Cloudinary upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  
  // Determine resource type based on file type
  if (file.type.startsWith('video/')) {
    formData.append('resource_type', 'video');
  } else if (file.type.startsWith('image/')) {
    formData.append('resource_type', 'image');
  } else {
    formData.append('resource_type', 'auto');
  }

  // Upload to Cloudinary
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        } catch (error) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          let errorMessage = error.error?.message || `Upload failed with status ${xhr.status}`;
          
          // Log full error for debugging
          console.error('Cloudinary upload error:', {
            status: xhr.status,
            error: error.error,
            fullResponse: xhr.responseText,
            cloudName,
            uploadPreset,
          });
          
          // Provide helpful error messages for common issues
          if (errorMessage.includes('Unknown API key') || errorMessage.includes('Invalid API key')) {
            // Even if preset is unsigned, this can happen if cloud name is wrong
            errorMessage = `Cloudinary error: "${errorMessage}". This usually means:\n1. Your cloud name (${cloudName}) is incorrect - check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME\n2. Or the preset "${uploadPreset}" doesn't exist or is misspelled\n3. Make sure you've redeployed after setting environment variables`;
          } else if (errorMessage.includes('Invalid upload preset')) {
            errorMessage = `Upload preset "${uploadPreset}" not found. Please check that:\n1. The preset name matches exactly (case-sensitive)\n2. The preset exists in Cloudinary Dashboard\n3. NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is set correctly`;
          } else if (errorMessage.includes('Invalid cloud name') || errorMessage.includes('not found')) {
            errorMessage = `Invalid Cloudinary cloud name "${cloudName}". Please:\n1. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in Vercel\n2. Make sure it matches your Cloudinary dashboard cloud name exactly\n3. Redeploy your application`;
          }
          
          reject(new Error(errorMessage));
        } catch {
          console.error('Failed to parse error response:', xhr.responseText);
          reject(new Error(`Upload failed with status ${xhr.status}. Response: ${xhr.responseText.substring(0, 200)}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    // Start upload
    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}

