export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans text-slate-100">
      <div className="relative w-16 h-16 mb-4">
        {/* Pulsing ring outer */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
        {/* Pulsing ring inner */}
        <div className="absolute inset-2 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin animate-reverse"></div>
      </div>
      <p className="text-sm font-semibold tracking-wider text-slate-400 animate-pulse">
        กำลังโหลดข้อมูล...
      </p>
    </div>
  );
}
