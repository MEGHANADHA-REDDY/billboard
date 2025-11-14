import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Delete the ad (positions will be deleted automatically due to cascade)
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
