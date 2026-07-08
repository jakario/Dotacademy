import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const videos = await prisma.resource.findMany({
    where: { type: 'VIDEO' },
    select: { id: true, title: true, content: true }
  });
  return NextResponse.json(videos);
}
