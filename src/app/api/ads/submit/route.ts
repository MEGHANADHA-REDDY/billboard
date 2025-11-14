import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering - API routes are always dynamic
export const dynamic = 'force-dynamic';

// Configure max duration for API calls
export const maxDuration = 30;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Validate database connection
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    // Parse JSON body (file is already uploaded to Cloudinary by frontend)
    const body = await request.json();
    
    const {
      userId,
      title,
      about,
      ctaUrl,
      mediaType,
      hideFromTime,
      hideToTime,
      positions,
      mediaUrl, // Cloudinary URL from direct upload
    } = body;

    // Validate required fields
    if (!userId || !mediaUrl || !positions || positions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, mediaUrl, and positions are required' },
        { status: 400 }
      );
    }

    // Validate that mediaUrl is from Cloudinary
    if (!mediaUrl.includes('cloudinary.com')) {
      return NextResponse.json(
        { error: 'Invalid media URL. Must be a Cloudinary URL.' },
        { status: 400 }
      );
    }

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
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack,
    });
    
    // Check for specific error types
    if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check DATABASE_URL environment variable.' },
        { status: 500 }
      );
    }
    
    if (error?.message?.includes('Cloudinary')) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Return error message - will be logged in Vercel
    const errorMessage = error?.message || 'Internal server error';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: error?.code,
      },
      { status: 500 }
    );
  }
}
