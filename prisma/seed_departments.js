const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding departments...');
  const departments = [
    { name: 'สำนักงานเลขานุการกรม', description: 'บริหารงานทั่วไป ธุรการ การเงิน และทรัพยากรบุคคล', icon: '🏢' },
    { name: 'กองยุทธศาสตร์และแผนงาน', description: 'กำหนดทิศทาง วางแผนยุทธศาสตร์ด้านการท่องเที่ยว', icon: '📊' },
    { name: 'กองพัฒนามาตรฐานบุคลากรด้านการท่องเที่ยว', description: 'พัฒนาศักยภาพและมาตรฐานของมัคคุเทศก์และบุคลากร', icon: '🎓' },
    { name: 'กองพัฒนาบริการท่องเที่ยว', description: 'ยกระดับและพัฒนามาตรฐานการให้บริการทางการท่องเที่ยว', icon: '🛎️' },
    { name: 'กองพัฒนาแหล่งท่องเที่ยว', description: 'ส่งเสริมการพัฒนาและฟื้นฟูแหล่งท่องเที่ยวต่างๆ', icon: '🏞️' },
    { name: 'กองกิจการภาพยนตร์และวีดิทัศน์ต่างประเทศ', description: 'ส่งเสริมและอำนวยความสะดวกการถ่ายทำภาพยนตร์ต่างประเทศ (Thailand Film Office)', icon: '🎬' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }
  console.log('Departments seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
