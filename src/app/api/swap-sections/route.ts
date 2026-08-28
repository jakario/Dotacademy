import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // กำหนดให้ สำนักงานเลขานุการกรม เป็นลำดับที่ 7
    await prisma.$executeRawUnsafe(UPDATE "Section" SET "order" = 7 WHERE "title" LIKE '%สำนักงานเลขานุการกรม%';);
    
    // กำหนดให้ กลุ่มพัฒนาระบบบริหาร ไปเป็นลำดับที่ 8
    await prisma.$executeRawUnsafe(UPDATE "Section" SET "order" = 8 WHERE "title" LIKE '%กลุ่มพัฒนาระบบบริหาร%';);
    
    return NextResponse.json({ success: true, message: 'Swapped sections successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}