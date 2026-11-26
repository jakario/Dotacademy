export default function Loading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center font-sans">
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border-2 border-gray-900 max-w-xs w-full mx-4 text-center">
        <div className="relative w-16 h-16 mb-6 mx-auto">
          {/* Vibrant spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-100 border-t-blue-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-gray-50 border-t-amber-400 animate-[spin_1.5s_linear_infinite_reverse]"></div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">กำลังโหลดข้อมูล</h2>
        <p className="text-xs font-medium text-gray-500">
          กรุณารอสักครู่ ระบบกำลังจัดเตรียมเนื้อหา...
        </p>
      </div>
    </div>
  );
}
