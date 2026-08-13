import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) return { title: 'Not Found' };
  return { title: `${dept.name} | DOT Knowledge Hub` };
}

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      workflows: true,
      faqs: true,
      documents: true
    }
  });

  if (!dept) notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-6">
              <div className="text-7xl">{dept.icon || '🏢'}</div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {dept.name}
                </h1>
                <p className="mt-2 text-slate-600 font-medium">Department 101 Profile</p>
              </div>
            </div>
            <Link href="/departments" className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-xl transition-colors">
              &larr; กลับหน้ารวม
            </Link>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-bold text-slate-800 mb-4">ภารกิจและหน้าที่รับผิดชอบ</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              {dept.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Workflows */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="text-amber-500">🔄</span> Workflows
            </h3>
            {dept.workflows.length > 0 ? (
              <ul className="space-y-4">
                {dept.workflows.map(wf => (
                  <li key={wf.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-amber-300 transition-colors">
                    <h4 className="font-bold text-slate-800">{wf.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{wf.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ยังไม่มีข้อมูลกระบวนการทำงาน
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="text-blue-500">📚</span> KM Library
            </h3>
            {dept.documents.length > 0 ? (
              <ul className="space-y-4">
                {dept.documents.map(doc => (
                  <li key={doc.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:border-blue-300 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800">{doc.title}</h4>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        {doc.type}
                      </span>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 px-3 py-1.5 rounded-lg">
                      ดาวน์โหลด
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ยังไม่มีเอกสารในระบบ
              </div>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="text-emerald-500">💬</span> คำถามที่พบบ่อย (Q&A)
          </h3>
          {dept.faqs.length > 0 ? (
            <div className="space-y-4">
              {dept.faqs.map(faq => (
                <div key={faq.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Q: {faq.question}</h4>
                  <p className="text-slate-600">A: {faq.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              ยังไม่มีคำถามที่พบบ่อย
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
