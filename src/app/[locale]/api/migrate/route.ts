import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import data from './data.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if courses already exist to prevent duplicate migrations
    const existingCourses = await prisma.course.findMany({
      where: {
        id: { in: data.Course.map((c: any) => c.id) }
      }
    });

    if (existingCourses.length > 0) {
      return NextResponse.json({ success: true, message: 'Migration already completed previously.' });
    }

    // Convert string ISO dates back to Date objects for Prisma if necessary
    // Prisma createMany typically handles ISO strings for DateTime, but let's be safe.
    const fixDates = (items: any[]) => items.map(item => {
      const newItem = { ...item };
      if (newItem.createdAt) newItem.createdAt = new Date(newItem.createdAt);
      if (newItem.updatedAt) newItem.updatedAt = new Date(newItem.updatedAt);
      return newItem;
    });

    await prisma.$transaction(async (tx) => {
      await tx.course.createMany({ data: fixDates(data.Course) });
      await tx.section.createMany({ data: fixDates(data.Section) });
      await tx.resource.createMany({ data: fixDates(data.Resource) });
      await tx.quiz.createMany({ data: fixDates(data.Quiz) });
      await tx.question.createMany({ data: fixDates(data.Question) });
      await tx.option.createMany({ data: fixDates(data.Option) });
    });

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      stats: {
        courses: data.Course.length,
        sections: data.Section.length,
        resources: data.Resource.length,
        quizzes: data.Quiz.length,
        questions: data.Question.length,
        options: data.Option.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
