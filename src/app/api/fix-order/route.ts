import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const courses = await prisma.course.findMany();
    const results = [];
    
    for (const c of courses) {
      let order = 99; // Default to end
      
      // Check title for keywords
      if (c.title.includes('ความรู้ทั่วไป')) {
        order = 1;
      } else if (c.title.includes('บทบาท') || c.title.includes('หน้าที่') || c.title.includes('หน่วยงานภายใน')) {
        order = 2;
      } else if (c.title.includes('วิดีโอ')) {
        order = 3;
      }
      
      if (order !== 99 || c.order !== 99) {
        await prisma.course.update({
          where: { id: c.id },
          data: { order }
        });
        results.push({ title: c.title, newOrder: order });
      }
    }
    
    const finalCourses = await prisma.course.findMany({
      orderBy: { order: 'asc' },
      select: { title: true, order: true }
    });
    
    return NextResponse.json({ success: true, updated: results, finalOrder: finalCourses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
