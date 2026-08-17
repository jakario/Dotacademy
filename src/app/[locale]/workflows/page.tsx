import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';

export const metadata = {
  title: 'Workflow & Matrix | DOT Knowledge Hub',
  description: 'กระบวนการทำงานและจุดเชื่อมต่อ (Hand-off) ระหว่างฝ่าย',
};

export default async function WorkflowsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  let workflows = [];
  try {
    workflows = await prisma.workflow.findMany({
      include: {
        department: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Database connection failed, falling back to static data.");
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="text-amber-500">🔄</span> Workflows
            </h1>
            <p className="mt-2 text-slate-600">แผนผังกระบวนการทำงานมาตรฐานของแต่ละกอง (Standard Operating Procedures)</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-100 transition-colors font-semibold">
            &larr; กลับหน้าหลัก
          </Link>
        </div>

        {/* Standard Workflows */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.length > 0 ? (
              workflows.map(wf => (
                <Link 
                  key={wf.id} 
                  href={`/workflows/${wf.id}`}
                  className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all group flex flex-col h-full"
                >
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200 transition-colors">
                      {wf.department ? wf.department.name : 'ส่วนกลาง'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                    {wf.title}
                  </h3>
                  <p className="text-slate-600 text-sm flex-grow">
                    {wf.description}
                  </p>
                  <div className="mt-6 flex items-center text-amber-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                    ดูแผนผัง (Flowchart) <span>&rarr;</span>
                  </div>
                </Link>
              ))
            ) : (
              <>
                <Link 
                  href={`/workflows/demo-1`}
                  className="block p-6 rounded-2xl border border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200">
                      กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    กระบวนการขอใบอนุญาตประกอบธุรกิจนำเที่ยว
                  </h3>
                  <p className="text-slate-600 text-sm">
                    ขั้นตอนตั้งแต่ผู้ประกอบการยื่นเอกสาร การชำระค่าธรรมเนียม และการออกใบอนุญาต
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                    ดูแผนผัง (Flow) <span>&rarr;</span>
                  </div>
                </Link>

                <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                   <div className="text-4xl mb-3 opacity-50">🚧</div>
                   <h3 className="text-lg font-bold text-slate-500 mb-1">กำลังจัดทำข้อมูลเพิ่มเติม</h3>
                   <p className="text-slate-400 text-sm text-center max-w-sm">
                     แผนผังการทำงานของกองอื่นๆ จะถูกนำมาแสดงในส่วนนี้เมื่อมีข้อมูลเข้าสู่ระบบ
                   </p>
                </div>
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
