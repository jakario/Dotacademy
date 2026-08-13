import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';

export const metadata = {
  title: 'KM Library | DOT Knowledge Hub',
  description: 'คลังแบบฟอร์ม เอกสารอ้างอิง และคัมภีร์งาน',
};

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // In the future, we could add searchParams for filtering
  const documents = await prisma.document.findMany({
    include: {
      department: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="text-blue-600">📚</span> KM Library
            </h1>
            <p className="mt-2 text-slate-600">คลังแบบฟอร์ม เอกสารอ้างอิง และคัมภีร์งานของกรมการท่องเที่ยว</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-100 transition-colors font-semibold">
            &larr; กลับหน้าหลัก
          </Link>
        </div>

        {/* Search & Filter Bar (Mockup for now) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="ค้นหาเอกสาร..." 
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select className="border border-slate-300 rounded-xl px-4 py-3 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">ทุกหมวดหมู่</option>
            <option value="form">แบบฟอร์ม</option>
            <option value="manual">คู่มือการปฏิบัติงาน</option>
            <option value="policy">นโยบาย/ระเบียบ</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
            ค้นหา
          </button>
        </div>

        {/* Document List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {documents.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {documents.map(doc => (
                <div key={doc.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl mt-1">
                      {doc.type === 'PDF' ? '📄' : doc.type === 'DOCX' ? '📝' : doc.type === 'XLSX' ? '📊' : '📁'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{doc.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                          {doc.category}
                        </span>
                        {doc.department && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                            {doc.department.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full sm:w-auto text-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors"
                  >
                    ดาวน์โหลด
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">ยังไม่มีเอกสารในคลังความรู้</h3>
              <p className="text-slate-500">เอกสารคู่มือและแบบฟอร์มต่างๆ จะถูกนำมาจัดเก็บไว้ที่นี่ในอนาคต</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
