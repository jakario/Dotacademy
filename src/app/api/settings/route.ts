import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Default values — used when no setting exists in DB yet
export const DEFAULT_SETTINGS: Record<string, string> = {
  // Portal Header
  portal_title: 'ศูนย์การเรียนรู้และแบ่งปันประสบการณ์',

  // Course Academy Card
  course_academy_title: 'Course Academy',
  course_academy_subtitle: 'เข้าสู่ระบบการเรียนรู้ออนไลน์และทดสอบสมรรถนะบุคลากร',
  course_academy_icon: '🎓',

  // Department 101 Card
  dept101_title: 'Department 101',
  dept101_subtitle: 'โครงสร้าง ภารกิจของแต่ละกอง',
  dept101_icon: '🏢',

  // KM Library Card
  km_title: 'KM Library',
  km_subtitle: 'คลังแบบฟอร์ม เอกสารอ้างอิง และคัมภีร์งาน',
  km_icon: '📚',

  // Q&A Card
  qa_title: 'Cross-Dept Q&A',
  qa_subtitle: 'ถาม-ตอบปัญหาข้ามสายงาน ตรงถึงเจ้าของงาน',
  qa_icon: '💬',

  // Workflow Card
  workflow_title: 'Workflow',
  workflow_subtitle: 'แผนผังกระบวนการทำงานมาตรฐาน (SOPs) ของแต่ละกอง',
  workflow_icon: '🔄',
};

export async function GET() {
  try {
    const rows = await prisma.siteSettings.findMany();
    // Merge DB values over defaults
    const settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (e) {
    // If DB isn't ready yet, return defaults
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'SUPER_ADMIN only' }, { status: 403 });
    }

    const updates: Record<string, string> = await req.json();

    // Upsert each key
    const promises = Object.entries(updates).map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
