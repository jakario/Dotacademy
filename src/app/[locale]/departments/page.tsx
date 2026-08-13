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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="text-blue-600">🏢</span> Department 101
            </h1>
            <p className="mt-2 text-slate-600">รู้จักงานแต่ละฝ่ายใน 2 นาที โครงสร้างและภารกิจของกรมการท่องเที่ยว</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-100 transition-colors font-medium">
            &larr; กลับหน้าหลัก
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Link 
              key={dept.id} 
              href={`/departments/${dept.id}`}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-md hover:border-blue-500 transition-all group flex flex-col h-full"
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
                ดูรายละเอียด <span>&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
