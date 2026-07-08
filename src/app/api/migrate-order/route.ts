import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;');
    return NextResponse.json({ message: 'Migration successful' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
