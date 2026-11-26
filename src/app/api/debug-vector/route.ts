import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'info';

    if (action === 'info') {
      // Use string aggregation to avoid BigInt issues
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT 
          (SELECT count(*)::int FROM "ResourceEmbedding") as cnt,
          (SELECT array_length(embedding::real[], 1) FROM "ResourceEmbedding" LIMIT 1) as dims`
      );
      return NextResponse.json({
        embeddingCount: Number(result[0]?.cnt ?? 0),
        sampleDimension: Number(result[0]?.dims ?? 0)
      });
    }

    if (action === 'alter3072') {
      // ALTER column from vector(768) to vector(3072) 
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ResourceEmbedding" 
        ALTER COLUMN embedding TYPE vector(3072)
      `);
      // Also clear existing embeddings since they're the wrong dimension
      await prisma.$executeRawUnsafe(`DELETE FROM "ResourceEmbedding"`);
      return NextResponse.json({ success: true, message: 'Column altered to vector(3072) and old embeddings cleared' });
    }

    return NextResponse.json({ error: 'Use action=info or action=alter3072' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
