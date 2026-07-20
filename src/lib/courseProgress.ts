import { prisma } from "@/lib/prisma";

export async function checkAndGrantReward(userId: string, courseId: string): Promise<boolean> {
  try {
    // 1. Fetch course to get all sections, resources, and quizzes
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            resources: true,
            quiz: true,
          }
        }
      }
    });

    if (!course) return false;

    const allQuizzes = course.sections.map(s => s.quiz).filter(Boolean);
    const allResources = course.sections.flatMap(s => s.resources);

    // 2. Check if all quizzes are passed
    if (allQuizzes.length > 0) {
      const passedAttempts = await prisma.quizAttempt.findMany({
        where: {
          userId,
          passed: true,
          quizId: { in: allQuizzes.map(q => q!.id) }
        },
        select: { quizId: true }
      });
      const passedQuizIds = new Set(passedAttempts.map(a => a.quizId));
      for (const q of allQuizzes) {
        if (!passedQuizIds.has(q!.id)) {
          return false; // User has not passed all quizzes
        }
      }
    }

    // 3. Check if all resources are completed
    if (allResources.length > 0) {
      const completedProgress = await prisma.userProgress.findMany({
        where: {
          userId,
          isCompleted: true,
          resourceId: { in: allResources.map(r => r.id) }
        },
        select: { resourceId: true }
      });
      const completedResourceIds = new Set(completedProgress.map(p => p.resourceId));
      for (const r of allResources) {
        if (!completedResourceIds.has(r.id)) {
          return false; // User has not completed all resources
        }
      }
    }

    // 4. If all checks pass, try to grant reward
    const existingClaim = await (prisma as any).rewardClaim.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!existingClaim) {
      const claimCount = await (prisma as any).rewardClaim.count({
        where: { courseId }
      });

      if (claimCount < 20) {
        await (prisma as any).rewardClaim.create({
          data: { userId, courseId }
        });
        return true; // Newly won reward
      }
    }
    return false;
  } catch (error) {
    console.error("checkAndGrantReward error:", error);
    return false;
  }
}
