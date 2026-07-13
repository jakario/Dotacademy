'use client';

import { Link } from "@/i18n/routing";

interface CourseItem {
  id: string;
  title: string;
  description: string | null;
  instructor: {
    name: string | null;
  };
  _count: {
    sections: number;
  };
  category?: string;
}

interface CoursesClientProps {
  initialCourses: CourseItem[];
  isAdminOrInstructor: boolean;
  hasPassedAll: boolean;
  totalQuizzes: number;
  passedQuizzes: number;
}

export default function CoursesClient({ 
  initialCourses, 
  isAdminOrInstructor, 
  hasPassedAll,
  totalQuizzes,
  passedQuizzes
}: CoursesClientProps) {

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
              หลักสูตรทั้งหมด
            </h1>
            <p className="text-slate-400 mt-2 text-sm">ค้นหาและกรองบทเรียนพัฒนาศักยภาพผู้เรียน</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {isAdminOrInstructor && (
              <Link href="/admin" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-500/10">
                จัดการระบบ (Admin)
              </Link>
            )}
            <Link href="/profile" className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white font-semibold rounded-xl text-xs transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              โปรไฟล์ของฉัน
            </Link>
            <Link
              href="/feedback"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/50 text-amber-400 hover:text-amber-300 font-semibold rounded-xl text-xs transition-all"
            >
              💬 ข้อเสนอแนะเพิ่มเติม
            </Link>
            <Link href="/" className="text-slate-400 hover:text-white transition-colors text-xs font-semibold">
              ← กลับหน้าหลัก
            </Link>
          </div>
        </div>


        {(hasPassedAll || isAdminOrInstructor) && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <span className="text-4xl animate-bounce">🏆</span>
              <div>
                <h3 className="text-base font-bold text-amber-400">
                  {hasPassedAll ? "คุณผ่านการอบรมหลักสูตรเรียบร้อยแล้ว!" : "ตัวอย่างใบรับรอง (สิทธิ์ผู้ดูแลระบบ/ผู้สอน)"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {hasPassedAll 
                    ? "คุณได้สอบผ่านแบบทดสอบครบถ้วนทุกบทเรียน สามารถรับใบรับรองการอบรมเรื่อง ความรู้ทั่วไปเกี่ยวกับกรมการท่องเที่ยว ได้ทันที"
                    : "คุณสามารถคลิกปุ่มเพื่อดูตัวอย่างและทดสอบการพิมพ์ไฟล์ใบรับรอง (Certificate) ได้ทันทีในฐานะผู้ดูแลระบบ"}
                </p>
              </div>
            </div>
            <Link 
              href="/courses/certificate" 
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap cursor-pointer"
            >
              🎓 รับใบรับรองการอบรม (PDF)
            </Link>
          </div>
        )}

        {!hasPassedAll && !isAdminOrInstructor && totalQuizzes > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/5 via-slate-800/80 to-indigo-500/5 border border-slate-700/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <span className="text-4xl animate-pulse">📝</span>
              <div>
                <h3 className="text-base font-bold text-slate-200">
                  ความคืบหน้าแบบทดสอบเพื่อรับใบรับรอง
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  คุณชมวิดีโอครบแล้ว แต่ยังต้องสอบผ่าน **แบบทดสอบท้ายบท (Section Quiz)** ของแต่ละบทเรียนให้ผ่านเกณฑ์ทุกบทเรียนด้วยนะครับ
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                  <div className="w-full sm:w-48 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${(passedQuizzes / totalQuizzes) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-blue-400 font-bold">สอบผ่านเกณฑ์แล้ว {passedQuizzes} / {totalQuizzes} แบบทดสอบ</span>
                </div>
              </div>
            </div>
            <button 
              disabled
              className="px-5 py-2.5 bg-slate-800/80 border border-slate-700 text-slate-500 text-xs font-bold rounded-xl whitespace-nowrap cursor-not-allowed"
            >
              🔒 ปลดล็อกเมื่อผ่านครบทุกบทเรียน
            </button>
          </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {initialCourses.map((course) => (
            <div key={course.id} className="bg-slate-800/30 rounded-2xl border border-slate-700/40 hover:border-slate-600 transition-all duration-300 overflow-hidden flex flex-col group shadow-sm hover:shadow-md">
              <div className="h-44 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-white text-xl font-bold text-center drop-shadow-md line-clamp-3 relative z-10">
                  {course.title}
                </h3>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-slate-400 text-xs mb-4 line-clamp-3 flex-grow leading-relaxed">
                  {course.description || "ไม่มีคำอธิบาย"}
                </p>
                <div className="flex items-center justify-end text-xs text-slate-500 mb-6 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                  <span>{course._count.sections} บทเรียน</span>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="w-full block text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-blue-500/10"
                >
                  ดูรายละเอียด / เข้าเรียน
                </Link>
              </div>
            </div>
          ))}
          
          {initialCourses.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-500 text-sm">
              ไม่พบหลักสูตร
            </div>
          )}
        </div>

        {/* Feedback Banner */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-900/30 via-slate-800/50 to-amber-900/20 border border-slate-700/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <span className="text-3xl">💬</span>
            <div>
              <h3 className="text-sm font-bold text-white">ข้อเสนอแนะเพิ่มเติม</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ร่วมแบ่งความคิดเห็นและข้อเสนอแนะ เพื่อพัฒนาระบบอบรมออนไลน์ของกรมการท่องเที่ยวให้ดียิ่งขึ้น
              </p>
            </div>
          </div>
          <Link
            href="/feedback"
            className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
          >
            💬 กรอกแบบสอบถามความพึงพอใจ
          </Link>
        </div>
      </div>
    </div>
  );
}
