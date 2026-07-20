import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const postSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Fetch all user completed resources under the course sections
    const completedProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        resource: {
          section: {
            courseId
          }
        }
      },
      select: {
        resourceId: true
      }
    });

    const completedIds = completedProgress.map(p => p.resourceId);

    // Fetch all user passed quizzes under the course sections
    const passedAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        passed: true,
        quiz: {
          section: {
            courseId
          }
        }
      },
      select: {
        quizId: true
      }
    });

    const passedQuizIds = passedAttempts.map(a => a.quizId);

    return NextResponse.json({ success: true, completedIds, passedQuizIds });
  } catch (error: any) {
    console.error("GET progress error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = postSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { resourceId } = result.data;
    const userId = (session.user as any).id;

    // Upsert user progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_resourceId: {
          userId,
          resourceId
        }
      },
      update: {
        isCompleted: true
      },
      create: {
        userId,
        resourceId,
        isCompleted: true
      }
    });

    // Check if this completion makes the entire course completed (and grant reward if so)
    let wonReward = false;
    try {
      const resourceWithCourse = await prisma.resource.findUnique({
        where: { id: resourceId },
        include: { section: { select: { courseId: true } } }
      });
      const courseId = resourceWithCourse?.section?.courseId;
      if (courseId) {
        const { checkAndGrantReward } = await import("@/lib/courseProgress");
        wonReward = await checkAndGrantReward(userId, courseId);
      }
    } catch (rewardError) {
      console.warn("RewardClaim from progress skipped:", rewardError);
    }

    return NextResponse.json({ success: true, progress, wonReward });
  } catch (error: any) {
    console.error("POST progress error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
