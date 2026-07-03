import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/th/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    redirect("/th/courses");
  }

  // Load all courses with instructor details, sections count, and quizzes count
  const courses = await prisma.course.findMany({
    include: {
      instructor: true,
      sections: {
        include: {
          quiz: true
        }
      },
      _count: {
        select: {
          sections: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Calculate some simple stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const draftCourses = totalCourses - publishedCourses;

  return (
    <AdminDashboardClient 
      initialCourses={courses.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        isPublished: c.isPublished,
        instructorName: c.instructor.name || "ผู้ดูแลระบบ",
        sectionsCount: c._count.sections,
        hasQuiz: c.sections.some(s => !!s.quiz)
      }))}
      stats={{
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses
      }}
    />
  );
}
