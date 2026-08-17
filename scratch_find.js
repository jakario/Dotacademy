const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({
    where: { id: 'cmsr6jrd5000367gw0wyi1qx4' },
    include: {
      sections: {
        include: {
          resources: true,
          quizzes: {
            include: {
              questions: true
            }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(course, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
