import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const updated = await prisma.course.updateMany({
      where: { isPublished: false },
      data: { isPublished: true, title: "ความรู้ทั่วไปเกี่ยวกับกรมการท่องเที่ยว (อัปเดตใหม่)" }
    });

    return NextResponse.json({
      success: true,
      count: updated.count,
      message: 'Courses published successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
