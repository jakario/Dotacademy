import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isAdmin(role: string) {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role);
}

export async function GET() {
  try {
    const docs = await prisma.document.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(docs);
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
    const { title, type, url, category, departmentId } = await req.json();
    if (!title || !url) {
      return NextResponse.json({ error: 'title and url are required' }, { status: 400 });
    }
    const doc = await prisma.document.create({
      data: { title, type: type || 'PDF', url, category: category || 'ทั่วไป', departmentId: departmentId || null },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
