import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS "RewardClaim" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "RewardClaim_pkey" PRIMARY KEY ("id")
      );
    `;

    const createIndexQuery = `
      CREATE UNIQUE INDEX IF NOT EXISTS "RewardClaim_userId_courseId_key" ON "RewardClaim"("userId", "courseId");
    `;

    const addForeignKeyUser = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RewardClaim_userId_fkey') THEN
          ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `;

    const addForeignKeyCourse = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RewardClaim_courseId_fkey') THEN
          ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `;

    await prisma.$executeRawUnsafe(createTableQuery);
    console.log('RewardClaim table created');
    
    await prisma.$executeRawUnsafe(createIndexQuery);
    console.log('RewardClaim unique index created');

    await prisma.$executeRawUnsafe(addForeignKeyUser);
    await prisma.$executeRawUnsafe(addForeignKeyCourse);
    console.log('RewardClaim foreign keys created');

    return NextResponse.json({ 
      message: "Migration successful! RewardClaim table added." 
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ 
      error: "Failed to migrate database", 
      details: error.message 
    }, { status: 500 });
  }
}
