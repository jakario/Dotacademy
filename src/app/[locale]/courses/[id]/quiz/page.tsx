import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuizClient from "./QuizClient";
import { getOptionalSession } from "@/lib/authOptional";

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

  const session = await getOptionalSession();
  const isGuest = !(session && session.user);

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-xl text-center">ยังไม่มีแบบทดสอบสำหรับบทเรียนย่อยนี้</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        {isGuest && (
          <div className="bg-amber-100 border border-amber-300 text-amber-800 p-3 text-center mb-4 rounded max-w-3xl mx-auto mt-4">
            คุณกำลังใช้โหมดผู้เยี่ยมชม (Guest) – กรุณาเข้าสู่ระบบเพื่อทำและส่งแบบทดสอบนี้
            <a href="/login" className="ml-2 underline font-medium">เข้าสู่ระบบ</a>
          </div>
        )}
        <QuizClient quiz={quiz as any} courseId={id} isGuest={isGuest} />
      </div>
    </div>
  );
}
