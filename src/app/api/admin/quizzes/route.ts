import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const optionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  options: z.array(optionSchema).min(2, "At least 2 options are required"),
});

const quizSchema = z.object({
  sectionId: z.string().min(1, "Section ID is required"),
  title: z.string().min(1, "Title is required").optional(),
  passScore: z.number().min(0).max(100).optional(),
  questions: z.array(questionSchema).min(1, "At least 1 question is required"),
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

    const body = await request.json();
    const result = quizSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { sectionId, title, passScore, questions } = result.data;

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
          create: questions.map((q) => ({
            text: q.text,
            options: {
              create: q.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }))
        }
      }
    });

    return NextResponse.json({ success: true, quiz: newQuiz });
  } catch (error: any) {
    console.error("POST Admin Quiz error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
