import { Suspense } from 'react';
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

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        กำลังโหลดเนื้อหา...
      </div>
    }>
      <CourseDetailClient course={course} />
    </Suspense>
  );
}

