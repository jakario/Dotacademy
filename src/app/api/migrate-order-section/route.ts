import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Add order column to Section table if it doesn't exist
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Section" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;`);
      console.log('Added order column to Section table');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.code === '42701') {
        console.log('Section.order column already exists');
      } else {
        throw e;
      }
    }

    // 2. Add order column to Resource table if it doesn't exist
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Resource" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;`);
      console.log('Added order column to Resource table');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.code === '42701') {
        console.log('Resource.order column already exists');
      } else {
        throw e;
      }
    }

    return NextResponse.json({ 
      message: "Migration successful! 'order' column added to Section and Resource tables." 
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ 
      error: "Failed to migrate database", 
      details: error.message 
    }, { status: 500 });
  }
}
