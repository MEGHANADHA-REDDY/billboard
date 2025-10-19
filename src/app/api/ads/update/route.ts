import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, about, ctaUrl, hideFromTime, hideToTime, isActive } = body;

    if (!adId) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Update the ad
    const updatedAd = await prisma.ad.update({
      where: {
        id: adId
      },
      data: {
        about: about || null,
        ctaUrl: ctaUrl || null,
        hideFromTime: hideFromTime || null,
        hideToTime: hideToTime || null,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        positions: true
      }
    });

    return NextResponse.json({
      success: true,
      ad: updatedAd
    });

  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
