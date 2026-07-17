import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const results = [];
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    results.push('Extension vector created');
  } catch(e: any) { results.push('Vector error: ' + e.message); }
  
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "ResourceEmbedding" (
        "id" TEXT NOT NULL, 
        "resourceId" TEXT NOT NULL, 
        "content" TEXT NOT NULL, 
        "embedding" vector(768) NOT NULL, 
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        CONSTRAINT "ResourceEmbedding_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push('Table created');
  } catch(e: any) { results.push('Table error: ' + e.message); }
  
  try {
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "ResourceEmbedding_resourceId_key" ON "ResourceEmbedding"("resourceId");');
    results.push('Index created');
  } catch(e: any) { results.push('Index error: ' + e.message); }
  
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "ResourceEmbedding" ADD CONSTRAINT "ResourceEmbedding_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;');
    results.push('FK created');
  } catch(e: any) { results.push('FK error: ' + e.message); }

  return NextResponse.json({ success: true, results });
}
