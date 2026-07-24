const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres.whspfveltoaaoolhsphr:wODulm7EtfifeGjm@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require' });

async function main() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE "AuditLog" (
        "id" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "userId" TEXT,
        "entity" TEXT,
        "entityId" TEXT,
        "details" TEXT,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
    `);
    await client.query(`
      ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `);
    console.log("AuditLog created");
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

main();
