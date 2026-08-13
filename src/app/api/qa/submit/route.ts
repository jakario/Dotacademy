import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const formData = await req.formData();
    const departmentId = formData.get('departmentId')?.toString();
    const question = formData.get('question')?.toString();

    if (!departmentId || !question) {
      return NextResponse.redirect(new URL('/th/qa?error=missing_fields', req.url));
    }

    // In a real application, you might save this to a Question/Ticket table.
    // For now, we will save it directly to FAQ but without an answer, 
    // or just assume an admin will fill the answer later.
    // Let's create an FAQ with an empty answer to act as a pending question.
    await prisma.fAQ.create({
      data: {
        question: question,
        answer: 'ระบบได้รับคำถามของท่านแล้ว เจ้าหน้าที่ที่เกี่ยวข้องจะเข้ามาตอบในเร็วๆ นี้',
        departmentId: departmentId,
      }
    });

    // Redirect back to the QA page with a success parameter
    return NextResponse.redirect(new URL('/th/qa?success=true', req.url), 303);
    
  } catch (error) {
    console.error('Error submitting QA:', error);
    return NextResponse.redirect(new URL('/th/qa?error=server_error', req.url));
  }
}
