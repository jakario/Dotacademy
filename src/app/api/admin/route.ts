import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const { action, payload } = body;

    switch (action) {
      // --- Course Actions ---
      case "CREATE_COURSE": {
        const { title, description } = payload;
        const newCourse = await prisma.course.create({
          data: {
            title: title || "หลักสูตรใหม่",
            description: description || "",
            isPublished: false,
            instructorId: userId
          }
        });
        return NextResponse.json({ success: true, course: newCourse });
      }

      case "UPDATE_COURSE": {
        const { id, title, description, isPublished } = payload;
        const updatedCourse = await prisma.course.update({
          where: { id },
          data: {
            title,
            description,
            isPublished
          }
        });
        return NextResponse.json({ success: true, course: updatedCourse });
      }

      case "DELETE_COURSE": {
        const { id } = payload;
        await prisma.course.delete({
          where: { id }
        });
        return NextResponse.json({ success: true });
      }

      // --- Section Actions ---
      case "CREATE_SECTION": {
        const { courseId, title } = payload;
        const newSection = await prisma.section.create({
          data: {
            title: title || "หัวข้อใหม่",
            courseId
          }
        });
        return NextResponse.json({ success: true, section: newSection });
      }

      case "UPDATE_SECTION": {
        const { id, title } = payload;
        const updatedSection = await prisma.section.update({
          where: { id },
          data: { title }
        });
        return NextResponse.json({ success: true, section: updatedSection });
      }

      case "DELETE_SECTION": {
        const { id } = payload;
        await prisma.section.delete({
          where: { id }
        });
        return NextResponse.json({ success: true });
      }

      // --- Resource (Lesson) Actions ---
      case "CREATE_RESOURCE": {
        const { sectionId, title, type, content } = payload;
        const newResource = await prisma.resource.create({
          data: {
            title: title || "บทเรียนใหม่",
            type: type || "TEXT",
            content: content || "",
            sectionId
          }
        });
        return NextResponse.json({ success: true, resource: newResource });
      }

      case "UPDATE_RESOURCE": {
        const { id, title, type, content } = payload;
        const updatedResource = await prisma.resource.update({
          where: { id },
          data: {
            title,
            type,
            content
          }
        });
        return NextResponse.json({ success: true, resource: updatedResource });
      }

      case "DELETE_RESOURCE": {
        const { id } = payload;
        await prisma.resource.delete({
          where: { id }
        });
        return NextResponse.json({ success: true });
      }

      // --- Quiz Actions ---
      case "SAVE_QUIZ": {
        const { sectionId, title, passScore, questions } = payload;

        // Delete existing quiz for this section
        const existingQuiz = await prisma.quiz.findUnique({
          where: { sectionId }
        });

        if (existingQuiz) {
          await prisma.quiz.delete({
            where: { sectionId }
          });
        }

        // Create new quiz with questions and options
        const newQuiz = await prisma.quiz.create({
          data: {
            title: title || "แบบทดสอบท้ายบท",
            passScore: passScore || 60,
            sectionId,
            questions: {
              create: questions.map((q: any) => ({
                text: q.text,
                options: {
                  create: q.options.map((o: any) => ({
                    text: o.text,
                    isCorrect: o.isCorrect
                  }))
                }
              }))
            }
          }
        });

        return NextResponse.json({ success: true, quiz: newQuiz });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
