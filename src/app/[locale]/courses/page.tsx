import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CoursesClient from "./CoursesClient";

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: true,
      _count: {
        select: { sections: true, enrollments: true }
      }
    }
  });

  const isAdminOrInstructor = session && ((session.user as any).role === 'ADMIN' || (session.user as any).role === 'INSTRUCTOR');

  // Verify if student has passed all quizzes in the platform
  let hasPassedAll = false;
  let totalQuizzes = 0;
  let passedQuizzes = 0;
  if (session && session.user) {
    const userId = (session.user as any).id;
    const allQuizzes = await prisma.quiz.findMany({
      select: { id: true }
    });
    totalQuizzes = allQuizzes.length;
    
    if (totalQuizzes > 0) {
      const passedAttempts = await prisma.quizAttempt.findMany({
        where: {
          userId,
          passed: true
        },
        select: {
          quizId: true
        }
      });
      const passedQuizIds = new Set(passedAttempts.map(a => a.quizId));
      passedQuizzes = passedQuizIds.size;
      hasPassedAll = allQuizzes.every(q => passedQuizIds.has(q.id));
    }
  }

    const dbDebug = {
      courseCount: await prisma.course.count(),
      userCount: await prisma.user.count(),
      dbHost: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : 'no-url'
    };
  
    return (
      <CoursesClient 
        initialCourses={courses as any} 
        isAdminOrInstructor={!!isAdminOrInstructor} 
        hasPassedAll={hasPassedAll}
        totalQuizzes={totalQuizzes}
        passedQuizzes={passedQuizzes}
        dbDebug={dbDebug}
      />
    );
  }
