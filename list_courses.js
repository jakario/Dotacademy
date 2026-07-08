require('dotenv').config();
const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();
p.course.findMany({
  select: { id: true, title: true, createdAt: true },
  orderBy: { createdAt: 'asc' }
}).then(r => {
  r.forEach((c, i) => console.log(i+1, c.id, '|', c.title));
}).finally(() => p.$disconnect());
