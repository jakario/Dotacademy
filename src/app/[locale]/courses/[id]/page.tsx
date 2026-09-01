import { Suspense } from 'react';
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";
import { getOptionalSession } from "@/lib/authOptional";

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
        orderBy: { order: 'asc' },
        include: {
          resources: { orderBy: { order: 'asc' } },
          quiz: true
        }
      }
    }
  });

  // Optional session – if null we treat the user as Guest
  const session = await getOptionalSession();
  const isGuest = !(session && session.user);

  if (!course) {
    notFound();
  }

  return (
    <>
      {isGuest && (
        <div className="bg-amber-100 border border-amber-300 text-amber-800 p-3 text-center mb-4 rounded">
          คุณกำลังใช้โหมดผู้เยี่ยมชม (Guest) – เข้าสู่ระบบเพื่อทำแบบทดสอบและรับใบประกาศ
          <a href="/login" className="ml-2 underline font-medium">เข้าสู่ระบบ</a>
        </div>
      )}
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
          กำลังโหลดเนื้อหา...
        </div>
      }>
        <CourseDetailClient course={course} isGuest={isGuest} />
      </Suspense>
    </>
  );
}

