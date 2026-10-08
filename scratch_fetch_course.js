const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({
    where: { id: 'cmsr6jrd5000367gw0wyi1qx4' },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: { resources: true, quiz: true }
      }
    }
  });
  
  if (!course) {
    console.log("Course not found");
    return;
  }
  
  console.log(`Course: ${course.title}`);
  console.log(`Description: ${course.description}\n`);
  
  course.sections.forEach((s, idx) => {
    console.log(`Section ${idx + 1}: ${s.title}`);
    console.log(`Content: ${s.content?.substring(0, 100) || 'None'}`);
    console.log(`Resources: ${s.resources.length}`);
    console.log(`Quiz Exists: ${s.quiz ? 'Yes (' + s.quiz.id + ')' : 'No'}\n`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
