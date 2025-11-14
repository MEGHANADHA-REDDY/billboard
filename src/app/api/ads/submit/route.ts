import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

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

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    await writeFile(filePath, buffer);
    const mediaUrl = `/uploads/${fileName}`;

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

  } catch (error) {
    console.error('Ad submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
