'use client';

import { useEffect } from "react";
import { Link } from "@/i18n/routing";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans text-slate-100 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl font-bold mb-6">
        ⚠️
      </div>
      <h1 className="text-2xl font-black mb-2 text-white">เกิดข้อผิดพลาดบางอย่าง</h1>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        ระบบไม่สามารถดำเนินการตามคำขอของคุณได้ในขณะนี้ กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-blue-500/10"
        >
          ลองใหม่อีกครั้ง
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
