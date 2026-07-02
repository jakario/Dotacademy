export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CourseEditClient from "./CourseEditClient";

export default async function AdminCourseEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/th/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    redirect("/th/courses");
  }

  const { id } = await params;

  // Load course details including sections, resources, and quiz details with questions/options
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: true,
      sections: {
        include: {
          resources: true,
          quiz: {
            include: {
              questions: {
                include: {
                  options: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) {
    redirect("/admin");
  }

  return (
    <CourseEditClient 
      initialCourse={{
        id: course.id,
        title: course.title,
        description: course.description || "",
        isPublished: course.isPublished,
        sections: course.sections.map(s => ({
          id: s.id,
          title: s.title,
          resources: s.resources.map(r => ({
            id: r.id,
            title: r.title,
            type: r.type,
            content: r.content || ""
          })),
          quiz: s.quiz ? {
            title: s.quiz.title,
            passScore: s.quiz.passScore,
            questions: s.quiz.questions.map(q => ({
              id: q.id,
              text: q.text,
              options: q.options.map(o => ({
                id: o.id,
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }))
          } : null
        }))
      }}
    />
  );
}
