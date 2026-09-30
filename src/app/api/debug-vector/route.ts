import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Count existing embeddings
    const countResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM "ResourceEmbedding"
    `;

    // Sample one embedding to check its actual dimension
    let sampleDim = null;
    try {
      const sample: any[] = await prisma.$queryRaw`
        SELECT vector_dims(embedding)::int as dims FROM "ResourceEmbedding" LIMIT 1
      `;
      sampleDim = sample[0]?.dims;
    } catch (e: any) {
      sampleDim = `Error: ${e.message}`;
    }

    return NextResponse.json({
      embeddingCount: countResult[0]?.count ?? 0,
      sampleDimension: sampleDim
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
