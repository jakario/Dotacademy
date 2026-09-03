import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const courseId = 'cmsr6jz60001467gwzh0p2ndb';
    const quizzes = await prisma.quiz.findMany({
      where: { section: { course: { id: courseId } } },
      select: {
        id: true, passScore: true,
        section: { select: { title: true, order: true } },
        questions: { select: { id: true, question: true }, orderBy: { order: 'asc' } }
      },
      orderBy: { section: { order: 'asc' } }
    });

    const log: string[] = [];
    let passScoreUpdated = 0;
    let duplicatesRemoved = 0;

    for (const quiz of quizzes) {
      if (quiz.passScore === 100) {
        await prisma.quiz.update({ where: { id: quiz.id }, data: { passScore: 80 } });
        passScoreUpdated++;
        log.push('passScore 100->80: ' + quiz.section?.title?.substring(0, 50));
      }
    }

    const seen = new Map<string, string>();
    const toDelete: { id: string; q: string; s: string }[] = [];
    for (const quiz of quizzes) {
      for (const qn of quiz.questions) {
        const key = qn.question.trim().substring(0, 50);
        if (seen.has(key)) {
          toDelete.push({ id: qn.id, q: key, s: quiz.section?.title || '' });
          log.push('DUPE: ' + key + ' | in: ' + (quiz.section?.title || '').substring(0, 30));
        } else {
          seen.set(key, qn.id);
        }
      }
    }
    for (const dup of toDelete) {
      await prisma.question.delete({ where: { id: dup.id } });
      duplicatesRemoved++;
      log.push('DELETED: ' + dup.q);
    }

    return NextResponse.json({ success: true, passScoreUpdated, duplicatesRemoved, log });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
