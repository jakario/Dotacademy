const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.department.deleteMany({
    where: {
      name: 'กองยุทธศาสตร์และแผนงาน'
    }
  });
  console.log('Deleted incorrect department.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
