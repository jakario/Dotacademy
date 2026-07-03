import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Find the published course
    const course = await prisma.course.findFirst({
      where: { isPublished: true },
      include: { sections: true }
    });

    if (!course) {
      return NextResponse.json({ success: false, message: 'No published course found' });
    }

    if (course.sections.length > 0) {
      return NextResponse.json({ success: true, message: 'Course already has sections' });
    }

    // 2. Insert dummy sections
    const sections = [
      {
        title: "บทที่ 1: บทนำและความสำคัญ",
        content: "เนื้อหาเกริ่นนำเกี่ยวกับกรมการท่องเที่ยว",
        order: 1,
        courseId: course.id
      },
      {
        title: "บทที่ 2: นโยบายและทิศทาง",
        content: "ทิศทางการดำเนินงานของกรมการท่องเที่ยวในปีปัจจุบัน",
        order: 2,
        courseId: course.id
      },
      {
        title: "บทที่ 3: สรุปและแบบทดสอบ",
        content: "สรุปเนื้อหาทั้งหมดที่ได้เรียนมา",
        order: 3,
        courseId: course.id
      }
    ];

    await prisma.section.createMany({
      data: sections
    });

    return NextResponse.json({
      success: true,
      message: 'Created 3 sections for the course'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
