import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe('UPDATE "Section" SET "order" = 7 WHERE "title" LIKE \'%สำนักงานเลขานุการกรม%\';');
    await prisma.$executeRawUnsafe('UPDATE "Section" SET "order" = 8 WHERE "title" LIKE \'%กลุ่มพัฒนาระบบบริหาร%\';');
    return NextResponse.json({ success: true, message: 'Swapped sections successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}