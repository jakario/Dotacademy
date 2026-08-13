import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';

export const metadata = {
  title: 'Cross-Department Q&A | DOT Knowledge Hub',
  description: 'ถาม-ตอบปัญหาข้ามสายงาน ตรงถึงเจ้าของงาน',
};

export default async function QAPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Fetch departments for the submission form
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  // Fetch existing FAQs
  const faqs = await prisma.fAQ.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="text-emerald-500">💬</span> Cross-Dept Q&A
            </h1>
            <p className="mt-2 text-slate-600">คลังคำถามที่พบบ่อย และระบบตั้งคำถามข้ามสายงานถึงเจ้าของงานโดยตรง</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-100 transition-colors font-semibold">
            &larr; กลับหน้าหลัก
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main FAQ List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">คำถามที่พบบ่อยล่าสุด</h2>
            
            {faqs.length > 0 ? (
              <div className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                        {faq.department?.name || 'ทั่วไป'}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {faq.createdAt.toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Q: {faq.question}</h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-slate-700 whitespace-pre-line">
                        <span className="font-bold text-slate-900">A:</span> {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">ยังไม่มีคำถามที่พบบ่อยในระบบ</h3>
                <p className="text-slate-500">คำถามและคำตอบจากแต่ละกองจะถูกนำมาแสดงที่นี่</p>
              </div>
            )}
          </div>

          {/* Ask Question Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-emerald-500">✉️</span> ส่งคำถามใหม่
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                หากไม่พบคำตอบในระบบ คุณสามารถส่งคำถามตรงถึงหน่วยงานที่เกี่ยวข้องได้
              </p>
              
              <form action="/api/qa/submit" method="POST" className="space-y-4">
                <div>
                  <label htmlFor="departmentId" className="block text-sm font-bold text-slate-700 mb-1">
                    ส่งถึงหน่วยงาน
                  </label>
                  <select 
                    id="departmentId" 
                    name="departmentId"
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">เลือกหน่วยงาน...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="question" className="block text-sm font-bold text-slate-700 mb-1">
                    คำถามของคุณ
                  </label>
                  <textarea 
                    id="question"
                    name="question"
                    required
                    rows={4}
                    placeholder="พิมพ์คำถามที่ต้องการสอบถาม..."
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
                >
                  ส่งคำถาม
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
