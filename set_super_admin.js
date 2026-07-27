const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: 'jakario@gmail.com' },
      data: { role: 'SUPER_ADMIN' },
    });
    console.log('Updated user role successfully:', user.email, user.role);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
