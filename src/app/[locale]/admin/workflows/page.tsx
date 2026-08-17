import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminWorkflowsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role === 'STUDENT') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-white">จัดการระบบแผนผัง Workflow</h1>
        <p className="text-slate-400 mb-8">
          ระบบวาดแผนผังและแก้ไขรูปแบบ (Drag & Drop และ JSON) กำลังอยู่ระหว่างการพัฒนา (Under Construction)
        </p>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
           <div className="text-6xl mb-4">🚧</div>
           <h2 className="text-xl font-bold text-slate-200">ระบบนี้กำลังถูกสร้างโดย AI</h2>
           <p className="text-slate-400 mt-2">โปรดรอการอัปเดตในเร็วๆ นี้</p>
        </div>
      </div>
    </div>
  );
}
