import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all ads for the user with their positions
    const ads = await prisma.ad.findMany({
      where: {
        userId: userId
      },
      include: {
        positions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ ads });

  } catch (error) {
    console.error('Error fetching user ads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
