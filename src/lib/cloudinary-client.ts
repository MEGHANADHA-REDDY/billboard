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
    throw new Error('Cloudinary cloud name is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable.');
  }

  if (!uploadPreset) {
    throw new Error('Upload preset is required. Please create an unsigned upload preset in Cloudinary dashboard.');
  }

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
          reject(new Error(error.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
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

