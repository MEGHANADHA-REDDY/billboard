import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Optional folder path in Cloudinary
 * @param resourceType - 'image' or 'video'
 * @returns Cloudinary upload result with secure URL
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'billboard-ads',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<{ secure_url: string; public_id: string }> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    };

    // If file is a buffer, convert to base64 data URI
    if (Buffer.isBuffer(file)) {
      const base64 = file.toString('base64');
      const dataUri = `data:application/octet-stream;base64,${base64}`;
      cloudinary.uploader.upload(dataUri, uploadOptions, (error, result) => {
        if (error) reject(error);
        else if (result) resolve({ secure_url: result.secure_url!, public_id: result.public_id! });
        else reject(new Error('Upload failed: No result returned'));
      });
    } else {
      // If it's already a string (base64 or data URI)
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error) reject(error);
        else if (result) resolve({ secure_url: result.secure_url!, public_id: result.public_id! });
        else reject(new Error('Upload failed: No result returned'));
      });
    }
  });
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @param resourceType - 'image' or 'video'
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

