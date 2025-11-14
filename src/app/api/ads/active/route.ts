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
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack,
    });
    
    // Check for common database connection errors
    if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check DATABASE_URL environment variable.' },
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
