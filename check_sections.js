const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.section.findMany({
    where: { courseId: 'cmsr6jrd5000367gw0wyi1qx4' },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, order: true }
  });
  console.log(sections);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());