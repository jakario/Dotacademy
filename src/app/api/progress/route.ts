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
    return NextResponse.json({ success: true, completedIds });
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

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    console.error("POST progress error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
