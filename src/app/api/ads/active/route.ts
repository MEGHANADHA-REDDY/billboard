import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
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

  } catch (error) {
    console.error('Error fetching active ads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
