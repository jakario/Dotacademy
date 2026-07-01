import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans text-slate-100 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl font-bold mb-6 animate-bounce">
        🔍
      </div>
      <h1 className="text-3xl font-black mb-2 text-white">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        หน้าเว็บหรือหลักสูตรที่คุณพยายามเข้าถึงอาจถูกลบไปแล้ว หรือลิงก์อาจจะไม่ถูกต้อง
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-blue-500/10"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
