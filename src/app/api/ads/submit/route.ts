import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Force dynamic rendering - API routes are always dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const userId = formData.get('userId') as string;
    const title = formData.get('title') as string;
    const about = formData.get('about') as string;
    const ctaUrl = formData.get('ctaUrl') as string;
    const mediaType = formData.get('mediaType') as string;
    const hideFromTime = formData.get('hideFromTime') as string;
    const hideToTime = formData.get('hideToTime') as string;
    const positions = JSON.parse(formData.get('positions') as string);
    const file = formData.get('file') as File;

    if (!userId || !file || !positions || positions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing:', {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      });
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.' },
        { status: 500 }
      );
    }

    // Upload file to Cloudinary
    console.log('Starting file upload to Cloudinary...', {
      fileName: file.name,
      fileSize: file.size,
      mediaType,
    });
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(
        buffer,
        'billboard-ads',
        mediaType === 'video' ? 'video' : 'image'
      );
      console.log('File uploaded successfully to Cloudinary:', uploadResult.secure_url);
    } catch (uploadError: any) {
      console.error('Cloudinary upload failed:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message || 'Unknown error'}`);
    }
    
    const mediaUrl = uploadResult.secure_url;

    // Create ad with positions
    const ad = await prisma.ad.create({
      data: {
        title: title || null,
        about: about || null,
        ctaUrl: ctaUrl || null,
        mediaType,
        mediaUrl,
        hideFromTime: hideFromTime || null,
        hideToTime: hideToTime || null,
        userId,
        positions: {
          create: positions.map((pos: { x: number; y: number }) => ({
            x: pos.x,
            y: pos.y
          }))
        }
      },
      include: {
        positions: true
      }
    });

    return NextResponse.json({
      success: true,
      ad: {
        id: ad.id,
        title: ad.title,
        about: ad.about,
        mediaUrl: ad.mediaUrl,
        mediaType: ad.mediaType,
        hideFromTime: ad.hideFromTime,
        hideToTime: ad.hideToTime,
        positions: ad.positions
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Ad submission error:', error);
    // Return more detailed error message in development, generic in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Internal server error'
      : 'Internal server error';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
