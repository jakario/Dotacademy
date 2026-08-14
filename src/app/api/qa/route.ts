import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isAdmin(role: string) {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role);
}

export async function GET() {
  try {
    const tickets = await prisma.qATicket.findMany({
      include: {
        department: true,
        asker: { select: { name: true, email: true } },
        answerer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tickets);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { question, departmentId, askerId, isAnonymous } = await req.json();
    if (!question || !departmentId) {
      return NextResponse.json({ error: 'question and departmentId are required' }, { status: 400 });
    }
    const ticket = await prisma.qATicket.create({
      data: {
        question,
        departmentId,
        askerId: askerId || null,
        isAnonymous: isAnonymous || false,
      },
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
