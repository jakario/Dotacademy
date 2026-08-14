import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isAdmin(role: string) {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const userId = (session.user as any).id;
    const { answer } = await req.json();
    const ticket = await prisma.qATicket.update({
      where: { id },
      data: { answer, status: 'ANSWERED', answererId: userId },
    });

    // Create in-app notification if asker is logged in
    if (ticket.askerId) {
      await prisma.notification.create({
        data: {
          userId: ticket.askerId,
          type: 'QA_ANSWERED',
          title: 'คำถามของคุณได้รับการตอบแล้ว',
          message: `คำถาม: "${ticket.question.substring(0, 60)}..." ได้รับการตอบกลับแล้วครับ`,
          linkUrl: '/qa',
        },
      });
    }

    return NextResponse.json(ticket);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to answer' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await prisma.qATicket.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
