import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Step 1: Delete all existing embeddings (they have wrong dimensions)
    await prisma.$executeRawUnsafe(`DELETE FROM "ResourceEmbedding"`);
    
    // Step 2: ALTER column to vector(3072) for gemini-embedding-2
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ResourceEmbedding" ALTER COLUMN embedding TYPE vector(3072)`
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Altered ResourceEmbedding.embedding to vector(3072) and cleared old data' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
