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
    
    // Extract unique course IDs from explicit enrollments, progress, and quiz attempts
    const enrolledCourseIds = new Set<string>();
    user.courses.forEach(e => enrolledCourseIds.add(e.courseId));
    user.progress.forEach(p => enrolledCourseIds.add(p.resource.section.courseId));
    user.quizAttempts.forEach(a => enrolledCourseIds.add(a.quiz.section.courseId));
    
    const courseIds = Array.from(enrolledCourseIds);
    
    const activeCourses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      include: {
        sections: {
          include: { resources: true, quiz: true },
        },
      },
    });

    for (const course of activeCourses) {
      const totalResources = course.sections.reduce((sum, s) => sum + s.resources.length, 0);
      const totalQuizzes = course.sections.filter(s => s.quiz).length;
      const totalItems = totalResources + totalQuizzes;

      const completedResources = user.progress.filter(
        p => p.resource.section.courseId === course.id
      ).length;

      const passedQuizzesForCourse = user.quizAttempts.filter(
        a => a.quiz.section.courseId === course.id
      ).length;

      const completedItems = completedResources + passedQuizzesForCourse;
      
      // Last activity
      const progressDates = user.progress
        .filter(p => p.resource.section.courseId === course.id)
        .map(p => new Date(p.createdAt));
      const attemptDates = user.quizAttempts
        .filter(a => a.quiz.section.courseId === course.id)
        .map(a => new Date(a.createdAt));
      const allDates = [...progressDates, ...attemptDates];
      const lastActivity = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null;

      courseCompletionMap[course.id] = {
        total: totalItems,
        completed: completedItems,
        lastActivity,
      };
    }

    // Determine the enrollment date (minimum of explicit enrollment, first progress, or first quiz attempt)
    const enrollmentsResponse = activeCourses.map(course => {
      let enrolledAt = new Date();
      const explicitEnrollment = user.courses.find(e => e.courseId === course.id);
      if (explicitEnrollment) {
        enrolledAt = new Date(explicitEnrollment.createdAt);
      } else {
        const progressDates = user.progress
          .filter(p => p.resource.section.courseId === course.id)
          .map(p => new Date(p.createdAt));
        const attemptDates = user.quizAttempts
          .filter(a => a.quiz.section.courseId === course.id)
          .map(a => new Date(a.createdAt));
        const allDates = [...progressDates, ...attemptDates];
        if (allDates.length > 0) {
          enrolledAt = new Date(Math.min(...allDates.map(d => d.getTime())));
        }
      }

      return {
        courseId: course.id,
        title: course.title,
        enrolledAt,
        completion: courseCompletionMap[course.id] || { total: 0, completed: 0, lastActivity: null },
        isCompleted:
          (courseCompletionMap[course.id]?.total || 0) > 0 &&
          (courseCompletionMap[course.id]?.completed || 0) >=
            (courseCompletionMap[course.id]?.total || 1),
      };
    });

    // Sort by most recent activity or enrollment
    enrollmentsResponse.sort((a, b) => {
      const timeA = a.completion.lastActivity?.getTime() || a.enrolledAt.getTime();
      const timeB = b.completion.lastActivity?.getTime() || b.enrolledAt.getTime();
      return timeB - timeA;
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      memberSince: user.createdAt,
      enrollments: enrollmentsResponse,
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
