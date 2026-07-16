'use client';

import { Link } from "@/i18n/routing";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfY9v89eh1QXnzorBQwRwnhkzGumyAnu6E6kg2Ig01MjUL5hA/viewform";

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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">

        {/* Top Banner */}
        <div className="mb-10 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/40 via-slate-800/60 to-amber-900/30 border border-slate-700 p-8 flex flex-col items-center text-center gap-4">
          <div className="text-6xl">🏛️</div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">
              เสียงของคุณมีความสำคัญ
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              กรมการท่องเที่ยวใส่ใจทุกความคิดเห็นจากผู้เข้าอบรม
              เพื่อนำไปพัฒนาหลักสูตรและระบบอบรมออนไลน์ให้ตอบโจทย์ยิ่งขึ้น
            </p>
          </div>
        </div>

        {/* CTA Card */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-xl">
          
          {/* Steps */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-900/60">
              <span className="text-2xl">1️⃣</span>
              <p className="text-xs text-slate-300 font-medium">กดปุ่มด้านล่าง</p>
              <p className="text-[10px] text-slate-500">เปิด Google Forms ในแท็บใหม่</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-900/60">
              <span className="text-2xl">2️⃣</span>
              <p className="text-xs text-slate-300 font-medium">กรอกแบบสอบถาม</p>
              <p className="text-[10px] text-slate-500">ใช้เวลาเพียง 2-3 นาที</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-900/60">
              <span className="text-2xl">3️⃣</span>
              <p className="text-xs text-slate-300 font-medium">กดส่ง</p>
              <p className="text-[10px] text-slate-500">ข้อมูลถูกบันทึกทันที</p>
            </div>
          </div>

          {/* Main CTA Button */}
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-xl">📋</span>
            กรอกแบบสอบถามความพึงพอใจ
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <p className="text-[11px] text-slate-500">
            🔒 ข้อมูลจะถูกเก็บรักษาไว้ใน Google Forms อย่างปลอดภัย
          </p>
        </div>

        {/* Alternative link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-2">หรือคัดลอกลิงก์ด้านล่างเพื่อเปิดในเบราว์เซอร์</p>
          <div className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
            <code className="text-[11px] text-blue-400 break-all select-all">{GOOGLE_FORM_URL}</code>
          </div>
        </div>

      </main>
    </div>
  );
}
