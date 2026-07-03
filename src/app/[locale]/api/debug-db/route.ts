import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    
    // Safely extract host from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || '';
    let host = 'unknown';
    try {
      if (dbUrl) {
        const urlObj = new URL(dbUrl);
        host = urlObj.host;
      }
    } catch (e) {
      host = 'invalid-url';
    }

    return NextResponse.json({
      success: true,
      userCount,
      courseCount,
      dbHost: host,
      hasUrl: !!dbUrl
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
