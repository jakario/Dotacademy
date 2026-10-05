const https = require('https');

const endpoints = [
  { name: 'หน้าแรก (Home)', url: 'https://knowledge.dot.go.th/th' },
  { name: 'หน้ารายการหลักสูตร (Courses)', url: 'https://knowledge.dot.go.th/th/courses' },
  { name: 'API หลักสูตร (Courses API)', url: 'https://knowledge.dot.go.th/api/courses' }
];

async function checkEndpoints() {
  console.log('กำลังตรวจสอบสถานะของระบบ DOT Knowledge...');
  let allPass = true;

  for (const ep of endpoints) {
    try {
      const status = await new Promise((resolve, reject) => {
        const req = https.request(ep.url, { method: 'GET', timeout: 5000 }, (res) => {
          resolve(res.statusCode);
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.end();
      });

      if (status >= 200 && status < 400) {
        console.log(`[PASS] ${ep.name} - Status: ${status}`);
      } else {
        console.log(`[FAIL] ${ep.name} - Status: ${status}`);
        allPass = false;
      }
    } catch (err) {
      console.log(`[ERROR] ${ep.name} - ${err.message}`);
      allPass = false;
    }
  }
  
  if (allPass) {
    console.log('\\n✅ ระบบหลักพร้อมใช้งาน 100%');
  } else {
    console.log('\\n⚠️ พบปัญหาบางส่วนในการเข้าถึงระบบ');
  }
}

checkEndpoints();
