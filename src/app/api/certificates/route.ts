import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function generateCertNo() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DOT-2026-${result}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if user already has a certificate for this course
    const existingCert = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingCert) {
      return NextResponse.json({ success: true, certificate: existingCert });
    }

    // Generate new cert
    const certNo = generateCertNo();
    const certificate = await prisma.certificate.create({
      data: {
        certNo,
        userId,
        courseId
      }
    });

    return NextResponse.json({ success: true, certificate }, { status: 201 });
  } catch (error: any) {
    console.error('Create Certificate Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}