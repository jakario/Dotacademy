import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isAdmin(role: string) {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role);
}

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(faqs);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { question, answer, departmentId } = await req.json();
    if (!question || !answer) {
      return NextResponse.json({ error: 'question and answer are required' }, { status: 400 });
    }
    const faq = await prisma.fAQ.create({
      data: { question, answer, departmentId: departmentId || null },
    });
    return NextResponse.json(faq, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
