import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const manuals = [
      { title: 'คู่มือจองรถ', url: '/pdfs/manuals/bookingcar_manual_user.pdf', category: 'คู่มือการปฏิบัติงาน', deptName: 'สำนักงานเลขานุการกรม' },
      { title: 'คู่มือ IT Service', url: '/pdfs/manuals/usermanual_itservice.pdf', category: 'คู่มือการปฏิบัติงาน', deptName: 'ศูนย์เทคโนโลยีสารสนเทศ' },
      { title: 'คู่มือระบบ AD', url: '/pdfs/manuals/manual-ad.pdf', category: 'คู่มือการปฏิบัติงาน', deptName: 'ศูนย์เทคโนโลยีสารสนเทศ' },
      { title: 'คู่มือระบบการลา (สำหรับผู้บริหาร)', url: '/pdfs/manuals/manual-leave-admin.pdf', category: 'คู่มือการปฏิบัติงาน', deptName: 'สำนักงานเลขานุการกรม' },
      { title: 'คู่มือระบบการลา (สำหรับผู้ใช้ทั่วไป)', url: '/pdfs/manuals/manual-leave-user.pdf', category: 'คู่มือการปฏิบัติงาน', deptName: 'สำนักงานเลขานุการกรม' }
    ];

    for (const m of manuals) {
      // Find department
      let dept = await prisma.department.findFirst({ where: { name: { contains: m.deptName } } });
      
      // Upsert document
      const exists = await prisma.document.findFirst({ where: { url: m.url } });
      if (!exists) {
        await prisma.document.create({
          data: {
            title: m.title,
            type: 'PDF',
            url: m.url,
            category: m.category,
            departmentId: dept?.id || null
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Imported manuals successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}