import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import WorkflowClient from './WorkflowClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'demo-1') return { title: 'Demo Workflow | DOT Knowledge Hub' };
  
  const wf = await prisma.workflow.findUnique({ where: { id } });
  if (!wf) return { title: 'Not Found' };
  return { title: `${wf.title} | DOT Knowledge Hub` };
}

const demoNodes = [
  { 
    id: '1', type: 'custom', position: { x: 250, y: 50 }, 
    data: { label: 'ยื่นคำขอและเอกสาร', icon: '📝', department: 'ผู้ประกอบการ', color: 'green' } 
  },
  { 
    id: '2', type: 'custom', position: { x: 250, y: 200 }, 
    data: { label: 'ตรวจสอบความถูกต้องของเอกสาร', icon: '🔎', department: 'กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์', color: 'blue' } 
  },
  { 
    id: '3', type: 'custom', position: { x: 250, y: 350 }, 
    data: { label: 'รับชำระค่าธรรมเนียมและรับวางหลักประกัน', icon: '💰', department: 'กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์', color: 'blue' } 
  },
  { 
    id: '4', type: 'custom', position: { x: 250, y: 500 }, 
    data: { label: 'พิจารณาอนุมัติและออกใบอนุญาต', icon: '✅', department: 'กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์ (นายทะเบียน)', color: 'blue' } 
  }
];

const demoEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
];

export default async function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  
  let nodes = [];
  let edges = [];
  let title = '';
  let description = '';

  if (id === 'demo-1') {
    nodes = demoNodes;
    edges = demoEdges;
    title = 'กระบวนการขออนุญาตถ่ายทำภาพยนตร์ต่างประเทศ (Demo)';
    description = 'นี่คือตัวอย่างกระบวนการทำงานที่สร้างจาก React Flow สำหรับแสดงผลในระบบ Knowledge Hub';
  } else {
    const wf = await prisma.workflow.findUnique({
      where: { id },
      include: { department: true }
    });
    if (!wf) notFound();
    
    title = wf.title;
    description = wf.description || '';
    
    try {
      // Parse JSON data if it exists
      const parsedData = JSON.parse(wf.data);
      nodes = parsedData.nodes || [];
      edges = parsedData.edges || [];
    } catch (e) {
      nodes = [];
      edges = [];
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <Link href="/workflows" className="text-amber-600 hover:text-amber-700 font-semibold mb-2 inline-block">
              &larr; กลับหน้ารวม Workflows
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-slate-600 max-w-3xl">
              {description}
            </p>
          </div>
        </div>

        {/* Workflow Canvas */}
        <WorkflowClient initialNodes={nodes} initialEdges={edges} title="Flowchart" />

      </div>
    </div>
  );
}
