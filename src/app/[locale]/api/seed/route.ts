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
        courseId: course.id
      },
      {
        title: "บทที่ 2: นโยบายและทิศทาง",
        courseId: course.id
      },
      {
        title: "บทที่ 3: สรุปและแบบทดสอบ",
        courseId: course.id
      }
    ];

    await prisma.section.createMany({
      data: sections
    });
    
    // Add some resources for the sections
    const createdSections = await prisma.section.findMany({
      where: { courseId: course.id }
    });
    
    for (const sec of createdSections) {
      await prisma.resource.create({
        data: {
          title: "เนื้อหาการเรียน: " + sec.title,
          type: "TEXT",
          content: "นี่คือเนื้อหาสำหรับ " + sec.title + " โปรดศึกษาให้ครบถ้วน",
          sectionId: sec.id
        }
      });
    }

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
