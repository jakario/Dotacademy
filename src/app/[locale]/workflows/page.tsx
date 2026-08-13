import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';

export const metadata = {
  title: 'Workflow & Matrix | DOT Knowledge Hub',
  description: 'กระบวนการทำงานและจุดเชื่อมต่อ (Hand-off) ระหว่างฝ่าย',
};

// Mock data for Hand-off Matrix
const handoffData = [
  { from: 'กองพัฒนามาตรฐานบุคลากรฯ', to: 'กองพัฒนาบริการท่องเที่ยว', action: 'ส่งข้อมูลผู้ผ่านการอบรมเพื่อออกใบอนุญาต', sla: '3 วันทำการ' },
  { from: 'กองพัฒนาแหล่งท่องเที่ยว', to: 'กองยุทธศาสตร์และแผนงาน', action: 'ส่งรายงานสรุปการประเมินแหล่งท่องเที่ยวเพื่อจัดทำแผนปีถัดไป', sla: 'ทุกสิ้นไตรมาส' },
  { from: 'สำนักงานเลขานุการกรม', to: 'ทุกกอง', action: 'เวียนหนังสือสั่งการและประกาศกรม', sla: 'ภายใน 24 ชั่วโมง' },
  { from: 'กองกิจการภาพยนตร์ฯ', to: 'สำนักงานเลขานุการกรม', action: 'ส่งเรื่องเบิกจ่ายงบประมาณสนับสนุนกองถ่าย', sla: '5 วันทำการ' },
];

export default async function WorkflowsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const workflows = await prisma.workflow.findMany({
    include: {
      department: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="text-amber-500">🔄</span> Workflow & Matrix
            </h1>
            <p className="mt-2 text-slate-600">กระบวนการทำงานและจุดเชื่อมต่อ (Hand-off) ระหว่างหน่วยงาน</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-100 transition-colors font-semibold">
            &larr; กลับหน้าหลัก
          </Link>
        </div>

        {/* Cross-Department Hand-off Matrix */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Cross-Department Hand-off Matrix</h2>
            <p className="text-slate-600">จุดเชื่อมต่อกระบวนการทำงานระหว่างกอง (SLA และผู้รับผิดชอบ)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-sm border-b border-slate-200">
                  <th className="p-4 font-bold rounded-tl-xl">หน่วยงานต้นทาง (From)</th>
                  <th className="p-4 font-bold">หน่วยงานปลายทาง (To)</th>
                  <th className="p-4 font-bold">สิ่งที่ส่งมอบ (Action/Deliverable)</th>
                  <th className="p-4 font-bold rounded-tr-xl">ระยะเวลามาตรฐาน (SLA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {handoffData.map((row, i) => (
                  <tr key={i} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-4 text-slate-800 font-medium">{row.from}</td>
                    <td className="p-4 text-slate-800 font-medium">{row.to}</td>
                    <td className="p-4 text-slate-600">{row.action}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                        {row.sla}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Standard Workflows */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Standard Workflows</h2>
              <p className="text-slate-600">แผนผังกระบวนการทำงานมาตรฐาน (Standard Operating Procedures)</p>
            </div>
          </div>
          
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
              <div className="col-span-full text-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="text-5xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">ยังไม่มีข้อมูล Workflow</h3>
                <p className="text-slate-500">ระบบจะแสดงแผนผังการทำงานเมื่อมีการเพิ่มข้อมูลในระบบ</p>
                
                {/* Mockup for demonstration */}
                <div className="mt-8 pt-8 border-t border-slate-100 text-left">
                  <p className="text-sm text-slate-400 mb-4 text-center">ตัวอย่างการแสดงผล (ทดสอบระบบ)</p>
                  <Link 
                    href={`/workflows/demo-1`}
                    className="block p-6 rounded-2xl border border-amber-200 bg-amber-50 hover:border-amber-400 hover:shadow-md transition-all group"
                  >
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200">
                        กองกิจการภาพยนตร์และวีดิทัศน์ต่างประเทศ
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                      กระบวนการขออนุญาตถ่ายทำภาพยนตร์ต่างประเทศ (ตัวอย่าง)
                    </h3>
                    <p className="text-slate-600 text-sm">
                      ขั้นตอนตั้งแต่การยื่นเอกสาร การตรวจสอบสคริปต์ ไปจนถึงการออกใบอนุญาต
                    </p>
                    <div className="mt-4 flex items-center text-amber-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                      ดูแผนผังจำลอง (Demo Flow) <span>&rarr;</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
