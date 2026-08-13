import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { success } = await checkRateLimit(`quiz_${userId}`, 5, 60000); // 5 submits per min max
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { quizId } = await params;
    const body = await request.json();
    const { answers } = body as { answers: Record<string, string> };

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    for (const question of quiz.questions) {
      const selectedOptionId = answers[question.id];
      if (!selectedOptionId) continue;

      const selectedOption = question.options.find(o => o.id === selectedOptionId);
      if (selectedOption && selectedOption.isCorrect) {
        correctCount++;
      }
    }

    const score = (correctCount / totalQuestions) * 100;
    const passed = score >= quiz.passScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        score,
        passed,
        userId: (session.user as any).id,
        quizId: quiz.id
      }
    });

    // ---- Top-20 Reward Claim Logic ----
    let wonReward = false;
    if (passed) {
      try {
        // Get courseId via section -> quiz relation
        const quizWithSection = await prisma.quiz.findUnique({
          where: { id: quiz.id },
          include: { section: { select: { courseId: true } } }
        });
        const courseId = quizWithSection?.section?.courseId;

        if (courseId) {
          const userId = (session.user as any).id;
          
          // Import dynamic helper to avoid circular dependencies if any
          const { checkAndGrantReward } = await import("@/lib/courseProgress");
          wonReward = await checkAndGrantReward(userId, courseId);
        }
      } catch (rewardError) {
        // Reward table may not exist yet; silently skip
        console.warn("RewardClaim skipped:", rewardError);
      }
    }
    // ------------------------------------

    return NextResponse.json({
      score,
      passed,
      correctCount,
      totalQuestions,
      attemptId: attempt.id,
      wonReward,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
