import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล').max(100),
});

// GET - Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        courses: {
          select: {
            courseId: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                title: true,
                _count: { select: { sections: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        quizAttempts: {
          select: {
            id: true,
            score: true,
            passed: true,
            createdAt: true,
            quiz: {
              select: {
                title: true,
                section: {
                  select: {
                    title: true,
                    courseId: true,
                    course: { select: { title: true } },
                  },
                },
              },
            },
          },
          where: { passed: true },
          orderBy: { createdAt: 'desc' },
        },
        progress: {
          select: {
            resourceId: true,
            createdAt: true,
            resource: {
              select: {
                section: {
                  select: { courseId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate completion per course
    const courseCompletionMap: Record<string, { total: number; completed: number; lastActivity: Date | null }> = {};

    for (const enrollment of user.courses) {
      const course = await prisma.course.findUnique({
        where: { id: enrollment.courseId },
        include: {
          sections: {
            include: { resources: true, quiz: true },
          },
        },
      });
      if (!course) continue;

      const totalResources = course.sections.reduce((sum, s) => sum + s.resources.length, 0);
      const totalQuizzes = course.sections.filter(s => s.quiz).length;
      const totalItems = totalResources + totalQuizzes;

      const completedResources = user.progress.filter(
        p => p.resource.section.courseId === enrollment.courseId
      ).length;

      const passedQuizzesForCourse = user.quizAttempts.filter(
        a => a.quiz.section.courseId === enrollment.courseId
      ).length;

      const completedItems = completedResources + passedQuizzesForCourse;
      
      // Last activity
      const progressDates = user.progress
        .filter(p => p.resource.section.courseId === enrollment.courseId)
        .map(p => new Date(p.createdAt));
      const attemptDates = user.quizAttempts
        .filter(a => a.quiz.section.courseId === enrollment.courseId)
        .map(a => new Date(a.createdAt));
      const allDates = [...progressDates, ...attemptDates];
      const lastActivity = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null;

      courseCompletionMap[enrollment.courseId] = {
        total: totalItems,
        completed: completedItems,
        lastActivity,
      };
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      memberSince: user.createdAt,
      enrollments: user.courses.map(e => ({
        courseId: e.courseId,
        title: e.course.title,
        enrolledAt: e.createdAt,
        completion: courseCompletionMap[e.courseId] || { total: 0, completed: 0, lastActivity: null },
        isCompleted:
          (courseCompletionMap[e.courseId]?.total || 0) > 0 &&
          (courseCompletionMap[e.courseId]?.completed || 0) >=
            (courseCompletionMap[e.courseId]?.total || 1),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: result.data.name },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
