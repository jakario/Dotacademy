import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
    const courses = await prisma.course.findMany({ select: { id: true, title: true, isPublished: true, instructorId: true } });

    return NextResponse.json({
      success: true,
      users,
      courses
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
