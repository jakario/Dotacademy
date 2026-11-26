import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'วิดีโอความรู้: กองพัฒนาแหล่งท่องเที่ยว';
    const content = searchParams.get('url') || 'https://youtu.be/tGiXMlxSEaE';
    const sectionId = 'cmsr6jrd5000767gwswe3f5hr';

    let resource = await prisma.resource.findFirst({
      where: { title, sectionId }
    });

    if (!resource) {
      const lastRes = await prisma.resource.findFirst({
        where: { sectionId },
        orderBy: { order: 'desc' }
      });
      const nextOrder = lastRes ? lastRes.order + 1 : 1;
      
      resource = await prisma.resource.create({
        data: {
          title,
          type: 'VIDEO',
          content,
          sectionId,
          order: nextOrder
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Video added', resourceId: resource.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
