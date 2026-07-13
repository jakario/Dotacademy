'use client';

import { Link } from "@/i18n/routing";

// ✅ ลิงก์จาก Google Form ที่คุณส่งมา - เปลี่ยน /viewform เป็น /viewform?embedded=true
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdlQIi5jsgYSXeodw8I0bF_Vm9rTJIlX_e-nt6Z9aDg5IhpXg/viewform?embedded=true";

export function FeedbackClient() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-2xl">💬</span> ข้อเสนอแนะเพิ่มเติม
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              กรมการท่องเที่ยว — แบบสำรวจความพึงพอใจการอบรมออนไลน์
            </p>
          </div>
          <Link
            href="/courses"
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors border border-slate-700 rounded-lg px-3 py-1.5"
          >
            &larr; กลับหน้าหลักสูตร
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Banner */}
        <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900/40 via-slate-800/60 to-amber-900/30 border border-slate-700 p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="text-5xl shrink-0">🏛️</div>
          <div>
            <h2 className="text-lg font-black text-white mb-1">
              เสียงของคุณมีความสำคัญ
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              กรมการท่องเที่ยวใส่ใจทุกความคิดเห็นและข้อเสนอแนะจากผู้เข้าอบรม
              เพื่อนำไปพัฒนาหลักสูตรและระบบอบรมออนไลน์ให้ตอบโจทย์ยิ่งขึ้น
              กรุณากรอกแบบสอบถามด้านล่าง ขอบคุณครับ/ค่ะ
            </p>
          </div>
        </div>

        {/* Google Form Embed */}
        <div className="rounded-2xl overflow-hidden border border-slate-700 bg-white shadow-2xl shadow-slate-950/50">
          <iframe
            src={GOOGLE_FORM_URL}
            width="100%"
            height="900"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="แบบสอบถามข้อเสนอแนะเพิ่มเติม — DOT Academy"
            className="block w-full"
          >
            กำลังโหลดแบบสอบถาม...
          </iframe>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          ข้อมูลที่กรอกจะถูกส่งไปยัง Google Forms และเก็บไว้ใน Google Sheets ของกรมการท่องเที่ยวเท่านั้น
        </p>
      </main>
    </div>
  );
}
