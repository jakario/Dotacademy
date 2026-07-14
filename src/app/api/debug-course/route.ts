import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'no id provided' }, { status: 400 });

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        sections: {
          include: {
            resources: true,
            quiz: true
          }
        }
      }
    });

    return NextResponse.json({
      ok: true,
      courseExists: !!course,
      course
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 });
  }
}
