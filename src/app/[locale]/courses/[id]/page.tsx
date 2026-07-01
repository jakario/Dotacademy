import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: true,
      sections: {
        include: {
          resources: true,
          quiz: true
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} />;
}

