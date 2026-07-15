import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Create vector extension
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);

    // 2. Create ResourceEmbedding table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ResourceEmbedding" (
        "id" TEXT NOT NULL,
        "resourceId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "embedding" vector(768) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ResourceEmbedding_pkey" PRIMARY KEY ("id")
      );
    `);

    // 3. Create unique index
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ResourceEmbedding_resourceId_key" ON "ResourceEmbedding"("resourceId");
    `);

    // 4. Create foreign key constraint
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ResourceEmbedding" 
        ADD CONSTRAINT "ResourceEmbedding_resourceId_fkey" 
        FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (fkError: any) {
      // Ignore if constraint already exists
      console.log('Constraint might already exist:', fkError.message);
    }

    return NextResponse.json({ message: "RAG migration successful! 'ResourceEmbedding' table and vector extension added." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
