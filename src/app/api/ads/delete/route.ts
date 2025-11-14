import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';

// Force dynamic rendering - this route uses request.url which is dynamic
export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('adId');

    if (!adId) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Get the ad first to extract media URL for Cloudinary deletion
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: { mediaUrl: true, mediaType: true }
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary if the URL is a Cloudinary URL
    if (ad.mediaUrl && ad.mediaUrl.includes('cloudinary.com') && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        // Extract public_id from Cloudinary URL
        // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{public_id}
        const urlParts = ad.mediaUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
          // Get public_id (everything after 'upload' and before file extension)
          let publicId = urlParts.slice(uploadIndex + 1).join('/');
          // Remove file extension if present
          publicId = publicId.replace(/\.[^/.]+$/, '');
          
          await deleteFromCloudinary(
            publicId,
            ad.mediaType === 'video' ? 'video' : 'image'
          );
        }
      } catch (cloudinaryError) {
        // Log error but don't fail the request if Cloudinary deletion fails
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }

    // Delete the ad from database (positions will be deleted automatically due to cascade)
    await prisma.ad.delete({
      where: {
        id: adId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
