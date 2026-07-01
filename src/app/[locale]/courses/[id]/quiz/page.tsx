import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuizClient from "./QuizClient";

export default async function QuizPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sectionId?: string }>;
}) {
  const { id } = await params;
  const { sectionId } = await searchParams;

  if (!sectionId) {
    notFound();
  }
  
  const quiz = await prisma.quiz.findUnique({
    where: { sectionId },
    include: {
      questions: {
        include: {
          options: {
            select: { id: true, text: true } // Don't send isCorrect to client!
          }
        }
      }
    }
  });

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-xl text-center">ยังไม่มีแบบทดสอบสำหรับบทเรียนย่อยนี้</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizClient quiz={quiz as any} courseId={id} />
    </div>
  );
}
