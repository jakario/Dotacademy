const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sectionId = 'cmsr6jrd5000a67gwm0mift7m'; // Section 6
  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (section && section.title.includes('and')) {
    const updated = await prisma.section.update({
      where: { id: sectionId },
      data: { title: section.title.replace('and', 'และ') }
    });
    console.log('Fixed Section 6 Title:', updated.title);
  } else {
    console.log('Section 6 looks fine or not found.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
