import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';

export const metadata = {
  title: 'Department 101 | DOT Knowledge Hub',
  description: 'รู้จักงานแต่ละฝ่ายใน 2 นาที โครงสร้างและภารกิจ',
};

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const departments = await prisma.department.findMany({
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section: DOT Profile */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white font-medium mb-8 transition-colors">
            &larr; กลับหน้าหลัก
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
                กรมการท่องเที่ยว
              </h1>
              <p className="text-xl text-blue-200 mb-8">Department of Tourism (DOT)</p>
              
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-amber-400 font-bold text-lg mb-2 flex items-center gap-2">
                    <span>👁️</span> วิสัยทัศน์ (Vision)
                  </h3>
                  <p className="text-white leading-relaxed font-medium">
                    "ภายในปี พ.ศ. 2570 การท่องเที่ยวของประเทศไทยเป็นอุตสาหกรรมที่เน้นคุณค่า มีความสามารถในการปรับตัว เติบโตอย่างยั่งยืนและมีส่วนร่วม"
                  </p>
                  <p className="text-blue-200 text-sm mt-2">
                    (Rebuilding High Value Tourism Industry with Resilience, Sustainability and Inclusive Growth)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <h3 className="text-amber-400 font-bold text-xl mb-6 flex items-center gap-2">
                <span>🎯</span> ภารกิจหลัก (Core Missions)
              </h3>
              <ul className="space-y-4 text-blue-50">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">1.</span>
                  <span>พัฒนาแหล่งท่องเที่ยว สินค้า และบริการท่องเที่ยวให้มีคุณภาพ</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">2.</span>
                  <span>กำหนดและรับรองมาตรฐานอุตสาหกรรมท่องเที่ยวตามมาตรฐานสากล</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">3.</span>
                  <span>พัฒนาศักยภาพและมาตรฐานบุคลากรด้านการท่องเที่ยว</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">4.</span>
                  <span>ควบคุมและกำกับดูแลธุรกิจนำเที่ยวและมัคคุเทศก์</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">5.</span>
                  <span>ส่งเสริมและสนับสนุนการถ่ายทำภาพยนตร์ต่างประเทศในประเทศไทย</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">โครงสร้างองค์กร (Organization Structure)</h2>
          <p className="text-slate-600">6 กองหลักภายใต้การกำกับดูแลของกรมการท่องเที่ยว</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Link 
              key={dept.id} 
              href={`/departments/${dept.id}`}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 transition-all group flex flex-col h-full"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-left">
                {dept.icon || '🏢'}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                {dept.name}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed flex-grow">
                {dept.description}
              </p>
              <div className="mt-6 text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                ดูรายละเอียดภารกิจ <span>&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
