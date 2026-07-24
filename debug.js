const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const attempts = await prisma.quizAttempt.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: { user: true, quiz: { include: { section: true } } }
  });
  if (attempts.length === 0) return console.log('No attempts found');
  const userId = attempts[0].userId;
  const courseId = attempts[0].quiz.section.courseId;
  console.log('User:', attempts[0].user.email, 'Course:', courseId);
  
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { sections: { include: { resources: true, quiz: true } } }
  });
  
  const allResources = course.sections.flatMap(s => s.resources);
  const allQuizzes = course.sections.map(s => s.quiz).filter(Boolean);
  
  const progress = await prisma.userProgress.findMany({ where: { userId, resourceId: { in: allResources.map(r=>r.id) } } });
  const passedQuizzes = await prisma.quizAttempt.findMany({ where: { userId, passed: true, quizId: { in: allQuizzes.map(q=>q.id) } } });
  
  console.log('Resources completed:', progress.length, '/', allResources.length);
  for (const r of allResources) {
    if (!progress.find(p => p.resourceId === r.id && p.isCompleted)) {
      console.log('MISSING RESOURCE:', r.title, r.type);
    }
  }
  
  console.log('Quizzes passed:', new Set(passedQuizzes.map(q=>q.quizId)).size, '/', allQuizzes.length);
  
  const claim = await prisma.rewardClaim.findUnique({ where: { userId_courseId: { userId, courseId } } });
  console.log('Has claim:', !!claim);
}
main().catch(console.error).finally(() => prisma.$disconnect());
