import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering - API routes are always dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Validate database connection
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    // Get current time in HH:MM format
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Get all active ads with their positions
    const ads = await prisma.ad.findMany({
      where: {
        isActive: true
      },
      include: {
        positions: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter ads based on time range
    const filteredAds = ads.filter(ad => {
      // If no time range is set, show the ad
      if (!ad.hideFromTime || !ad.hideToTime) {
        return true;
      }
      
      // Check if current time is within the hidden period
      const hideFrom = ad.hideFromTime;
      const hideTo = ad.hideToTime;
      
      // If hideFrom is less than hideTo (e.g., 22:00 to 06:00), it spans midnight
      if (hideFrom < hideTo) {
        // Normal case: hideFrom < hideTo (e.g., 10:00 to 18:00)
        return !(currentTime >= hideFrom && currentTime <= hideTo);
      } else {
        // Midnight spanning case: hideFrom > hideTo (e.g., 22:00 to 06:00)
        return !(currentTime >= hideFrom || currentTime <= hideTo);
      }
    });

    return NextResponse.json({ ads: filteredAds });

  } catch (error: any) {
    console.error('Error fetching active ads:', error);
    // Return more detailed error for debugging
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Internal server error'
      : 'Internal server error';
    
    // Check for common database connection errors
    if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check DATABASE_URL environment variable.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
