const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
  } catch(e) { console.log(e.message) }
  
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "ResourceEmbedding" (
        "id" TEXT NOT NULL, 
        "resourceId" TEXT NOT NULL, 
        "content" TEXT NOT NULL, 
        "embedding" vector(768) NOT NULL, 
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        CONSTRAINT "ResourceEmbedding_pkey" PRIMARY KEY ("id")
      );
    `);
  } catch(e) { console.log(e.message) }
  
  try {
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "ResourceEmbedding_resourceId_key" ON "ResourceEmbedding"("resourceId");');
  } catch(e) { console.log(e.message) }
  
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "ResourceEmbedding" ADD CONSTRAINT "ResourceEmbedding_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;');
  } catch(e) { console.log(e.message) }
  
  console.log('Success');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
