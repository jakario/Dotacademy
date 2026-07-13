import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const createEnrollmentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

// GET all enrollments
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      }
    });

    return NextResponse.json({ success: true, enrollments });
  } catch (error: any) {
    console.error("GET Enrollments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST create enrollment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createEnrollmentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { userId, courseId } = result.data;

    // Check if already enrolled
    const existing = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "User is already enrolled in this course" }, { status: 400 });
    }

    const newEnrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      }
    });

    return NextResponse.json({ success: true, enrollment: newEnrollment });
  } catch (error: any) {
    console.error("POST Enrollment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
