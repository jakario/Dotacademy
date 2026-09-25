import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check current column type
    const colInfo: any[] = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'ResourceEmbedding' AND column_name = 'embedding'
    `;

    // Check if there's a specific vector dimension constraint
    const vecInfo: any[] = await prisma.$queryRaw`
      SELECT atttypmod FROM pg_attribute 
      WHERE attrelid = '"ResourceEmbedding"'::regclass 
      AND attname = 'embedding'
    `;

    // Count existing embeddings
    const countResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "ResourceEmbedding"
    `;

    // Sample one embedding to check its actual dimension
    let sampleDim = null;
    try {
      const sample: any[] = await prisma.$queryRaw`
        SELECT vector_dims(embedding) as dims FROM "ResourceEmbedding" LIMIT 1
      `;
      sampleDim = sample[0]?.dims;
    } catch (e: any) {
      sampleDim = `Error: ${e.message}`;
    }

    return NextResponse.json({
      columnInfo: colInfo,
      vectorTypemod: vecInfo,
      embeddingCount: countResult[0]?.count,
      sampleDimension: sampleDim
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
