import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Test basic DB connection
    const userCount = await prisma.user.count();
    
    // Test if user can be found (if session exists)
    let userTest = null;
    if (session?.user) {
      const userId = (session.user as any).id;
      userTest = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true }
      });
    }

    return NextResponse.json({
      ok: true,
      dbConnected: true,
      userCount,
      session: session ? { userId: (session.user as any).id, email: session.user?.email } : null,
      userTest,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5),
    }, { status: 500 });
  }
}
