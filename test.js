const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const id = 'cmr4gso110001juexcyawsysd';
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        sections: {
          include: {
            resources: true,
            quiz: true
          }
        }
      }
    });
    console.log("Found:", course ? "Yes" : "No");
    if (course) console.log("Sections count:", course.sections.length);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
