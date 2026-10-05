const https = require('https');

const BASE = 'https://knowledge.dot.go.th/api/ingest-tourism-books';

// ALL 49 files (re-embed everything since old embeddings were cleared)
const ALL_FILES = [
  '01 Guideline-E-book.md',
  '01 มาตรฐานการจัดกิจกรรมค่ายพักแรม Camping.md',
  '01 รายงานการศึกษาการคัดลือกพื้นที่พัฒนาแหล่งท่องเที่ยวที่มีศักยภาพ 2557.md',
  '01 แผนพัฒนา เส้นทางท่องเที่ยวน้ำพุร้อน ระนอง กระบี่ ฟังงา.md',
  '02 iDea for TraTourism ตราด.md',
  '02 Ranong -แนวทางพัฒนาเมืองสุขภาพระนอง.md',
  '02 เอกสารความรู้เบื้อง้ตน Rv 140862.md',
  '03 Camping and RV Vol 01.md',
  '03 Wellness Graphic Book  E-BOOK.md',
  '03 คู่มือเส้นทางท่องเที่ยว Brochure ท่องเที่ยว.md',
  '03 แผนพัฒนาแหล่งท่องเที่ยวเนินทราย (Sand Dune).md',
  '03-1 การศึกษาที่พักริมทาง Rest Area.md',
  '03-2 การศึกษาที่พักริมทาง Michinoeki.md',
  '03_เล่มตามรอยพญานาค.md',
  '04 รายงานการศึกษาพื้นที่ดอยผาหมี เชียงราย 2561.md',
  '04 รายงานฉบับสมบูรณ์ 1-2.md',
  '04 รายงานฉบับสมบูรณ์ 2-2.md',
  '04 ห้องน้ำเพื่อความหลากหลายทางเพศ (การศึกษาเบื้องต้น).md',
  '04_เล่มเที่ยวนครพนม.md',
  '05 YACHT.md',
  '05 แนวทางการพัฒนาการท่องเที่ยว บ่อเกลือ น่าน 2567.md',
  '05_เล่มแม่โขงม่วนซื่น.md',
  '06 แนวทางการพัฒนาอ่างน้ำผุดและพื้นที่เชื่อมโยง จังหวัดสุราษฎร์ธานี.md',
  '06_เล่มเมืองเก่าสองทะเล.md',
  '07 แนวทางการพัฒนาบ่อน้ำพุร้อนแม่จอก.md',
  '07_เล่มชิลเว่อร์พัทลุง.md',
  '08 แนวทางการพัฒนาม่อนพลอยล้านปี.md',
  '08_เล่มสายราชดำเนิน.md',
  '09 แนวทางการพัฒนาวัดแม่สูงเหนือวรรณาราม.md',
  '09_เล่มชมเมืองพริบพรี.md',
  '10 แนวทางการพัฒนาโบราณสถานเวียงลอ.md',
  '10_เล่มหัวหินดินแดนแห่งรัก.md',
  '11 แนวทางการพัฒนาบึงน้ำบางพลับ ตำบลบางพลับ อำเภอสองพี่น้อง จังหวัดสุพรรณบุรี.md',
  '11_เล่มเปิดโลกเมืองชุมพร.md',
  '12 แนวทางการพัฒนาอ่างเก็บน้ำลาดควาย.md',
  '12_เล่มเมืองเก่าระนอง.md',
  '13 แนวทางการพัฒนาพื้นที่ทุ่งน้อย ตาบลทุ่งน้อย อาเภอโพทะเล จังหวัดพิจิตร.md',
  '13_เล่มยลงานศิลป์เมืองฉะเชิงเทรา.md',
  '14 แนวทางการพัฒนาบึงกระดิ่ง ตาบลพยุหะ อาเภอพยุหะคีรี จังหวัดนครสวรรค์.md',
  '14_เล่มชลบุรีชิคแอนด์ชิลล์.md',
  '15 แนวทางการพัฒนาบึงหวาย ตาบลโกรกพระ อาเภอโกรกพระ จังหวัดนครสวรรค์.md',
  '15_เล่มเที่ยวป่าในเมือง.md',
  '16 แนวทางการพัฒนาบึงหนองสองห้อง ตาบลปากทาง อาเภอเมืองพิจิตร จังหวัดพิจิตร.md',
  '17 แนวทางการพัฒนาหนองทามปลาปึ่ง ตาบลหัวนา อาเภอเมืองหนองบัวลาภู จังหวัดหนองบัวลาภู.md',
  '18 แผนพัฒนาแหล่งท่องเที่ยวควนคานหลาว PRINT.md',
  'A-01 วารสารเส้นทางไดโนเสาร์.md',
  'A-02 รายงานการพัฒนาเส้นทางท่องเที่ยว ไดโนเสาร์.md',
  'A-03 รายงานสรุปผู้บริหาร Final ไดโนเสาร์.md',
];

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 55000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: { raw: data.substring(0, 200) } });
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Client timeout')); });
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function processFile(file, fileIndex) {
  const enc = encodeURIComponent(file);
  const prefix = `[${fileIndex + 1}/${ALL_FILES.length}]`;
  
  console.log(`\n${prefix} === ${file} ===`);

  // Step 1: Create resource (fast, no AI needed)
  console.log(`${prefix} Phase 1: Creating resource...`);
  try {
    const res1 = await httpGet(`${BASE}?file=${enc}&phase=resource`);
    if (res1.status !== 200) {
      console.log(`${prefix}   ❌ Resource creation failed: ${JSON.stringify(res1.data).substring(0, 150)}`);
      return false;
    }
    const { resourceId, totalChunks, totalBatches } = res1.data;
    console.log(`${prefix}   ✅ Resource: ${resourceId} (${totalChunks} chunks → ${totalBatches} batches)`);

    // Step 2: Embed in batches of 3 chunks each
    for (let batch = 0; batch < totalBatches; batch++) {
      const batchLabel = `batch ${batch + 1}/${totalBatches}`;
      
      let retries = 3;
      let success = false;
      while (retries > 0 && !success) {
        try {
          console.log(`${prefix} Embedding ${batchLabel}...`);
          const res2 = await httpGet(`${BASE}?file=${enc}&phase=embed&batch=${batch}&batchSize=3`);
          if (res2.status === 200 && res2.data.success) {
            console.log(`${prefix}   ✅ ${batchLabel}: chunks ${res2.data.processedRange}`);
            success = true;
          } else {
            const errMsg = JSON.stringify(res2.data).substring(0, 120);
            console.log(`${prefix}   ⚠️ ${batchLabel} (${res2.status}): ${errMsg}`);
            retries--;
            if (retries > 0) {
              const waitSec = retries === 2 ? 15 : 30;
              console.log(`${prefix}   ⏳ Retry in ${waitSec}s (${retries} left)`);
              await sleep(waitSec * 1000);
            }
          }
        } catch (err) {
          console.log(`${prefix}   ⚠️ ${batchLabel} error: ${err.message}`);
          retries--;
          if (retries > 0) {
            console.log(`${prefix}   ⏳ Retry in 15s (${retries} left)`);
            await sleep(15000);
          }
        }
      }

      if (!success) {
        console.log(`${prefix}   ❌ ${batchLabel} FAILED after all retries`);
        return false;
      }

      // Rate limit protection: wait between batches
      if (batch < totalBatches - 1) {
        await sleep(4500); // 4.5s between batches (safe for 15 RPM)
      }
    }

    console.log(`${prefix} ✅✅ COMPLETE`);
    return true;

  } catch (err) {
    console.log(`${prefix}   ❌ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  const startTime = Date.now();
  console.log(`=== Starting phased ingestion of ${ALL_FILES.length} files ===`);
  console.log(`Strategy: resource first, then embed 3 chunks/batch, 4.5s delay`);
  console.log(`Started: ${new Date().toLocaleTimeString()}\n`);

  const results = { success: [], failed: [] };

  for (let i = 0; i < ALL_FILES.length; i++) {
    const ok = await processFile(ALL_FILES[i], i);
    if (ok) {
      results.success.push(ALL_FILES[i]);
    } else {
      results.failed.push(ALL_FILES[i]);
    }
    // Wait between files
    if (i < ALL_FILES.length - 1) await sleep(6000);
  }

  const elapsed = Math.round((Date.now() - startTime) / 60000);
  console.log(`\n\n========== SUMMARY (${elapsed} minutes) ==========`);
  console.log(`✅ Success: ${results.success.length}/${ALL_FILES.length}`);
  console.log(`❌ Failed:  ${results.failed.length}/${ALL_FILES.length}`);
  if (results.failed.length > 0) {
    console.log('\nFailed files:');
    results.failed.forEach(f => console.log(`  - ${f}`));
  }
  console.log(`Finished: ${new Date().toLocaleTimeString()}`);
}

main();
