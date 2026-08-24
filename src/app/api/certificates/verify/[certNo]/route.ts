import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ certNo: string }> }
) {
  try {
    const { certNo } = await params;
    
    if (!certNo) {
      return NextResponse.json({ error: 'Certificate number is required' }, { status: 400 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certNo: certNo.toUpperCase() },
      include: {
        user: { select: { name: true, image: true, email: true } },
        course: { select: { title: true } }
      }
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, certificate });
  } catch (error: any) {
    console.error('Verify Certificate Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}