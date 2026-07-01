import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CertificateClient from "./CertificateClient";

export default async function CertificatePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/th/login");
  }

  const userId = (session.user as any).id;
  
  // Verify user has passed all quizzes
  const allQuizzes = await prisma.quiz.findMany({
    select: { id: true }
  });

  let hasPassedAll = false;
  if (allQuizzes.length > 0) {
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
    hasPassedAll = allQuizzes.every(q => passedQuizIds.has(q.id));
  }

  const isAdminOrInstructor = session && ((session.user as any).role === 'ADMIN' || (session.user as any).role === 'INSTRUCTOR');

  if (!hasPassedAll && !isAdminOrInstructor) {
    redirect("/th/courses");
  }

  return <CertificateClient />;
}
