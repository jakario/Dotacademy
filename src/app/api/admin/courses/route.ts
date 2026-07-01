import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const result = courseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { title, description } = result.data;
    const newCourse = await prisma.course.create({
      data: {
        title: title || "หลักสูตรใหม่",
        description: description || "",
        isPublished: false,
        instructorId: userId
      }
    });

    return NextResponse.json({ success: true, course: newCourse });
  } catch (error: any) {
    console.error("POST Admin Course error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
