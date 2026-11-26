import type { Metadata } from 'next';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CoursesClient from "./CoursesClient";

export const metadata: Metadata = {
  title: "หลักสูตรทั้งหมด | DOT Knowledge",
  description: "หลักสูตรการเรียนรู้ออนไลน์ กรมการท่องเที่ยว",
};

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  
  // Parallelize the course fetching and quiz status fetching
  let coursesPromise = prisma.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: true,
      _count: { select: { sections: true, enrollments: true } }
    },
    orderBy: { order: 'asc' }
  });

  let quizzesPromise = prisma.quiz.findMany({ select: { id: true } });
  
  let passedAttemptsPromise = session?.user 
    ? prisma.quizAttempt.findMany({
        where: { userId: (session.user as any).id, passed: true },
        select: { quizId: true }
      })
    : Promise.resolve([]);

  const [courses, allQuizzes, passedAttempts] = await Promise.all([
    coursesPromise,
    quizzesPromise,
    passedAttemptsPromise
  ]);

  const isAdminOrInstructor = session && (["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role) || (session.user as any).role === 'INSTRUCTOR');

  // Verify if student has passed all quizzes in the platform
  let hasPassedAll = false;
  let totalQuizzes = allQuizzes.length;
  let passedQuizzes = 0;
  
  if (session && session.user && totalQuizzes > 0) {
    const passedQuizIds = new Set(passedAttempts.map(a => a.quizId));
    passedQuizzes = passedQuizIds.size;
    hasPassedAll = allQuizzes.every(q => passedQuizIds.has(q.id));
  }

  return (
    <CoursesClient 
      initialCourses={courses as any} 
      isAdminOrInstructor={!!isAdminOrInstructor} 
      hasPassedAll={hasPassedAll}
      totalQuizzes={totalQuizzes}
      passedQuizzes={passedQuizzes}
    />
  );
}
