const https = require('https');

const BASE = 'https://knowledge.dot.go.th/api/ingest-tourism-books';

// Next chunk of 8 files (Files 9-16 from the remaining list)
const REMAINING_FILES = [
  '10_เล่มหัวหินดินแดนแห่งรัก.md',
  '11 แนวทางการพัฒนาบึงน้ำบางพลับ ตำบลบางพลับ อำเภอสองพี่น้อง จังหวัดสุพรรณบุรี.md',
  '11_เล่มเปิดโลกเมืองชุมพร.md',
  '12 แนวทางการพัฒนาอ่างเก็บน้ำลาดควาย.md',
  '12_เล่มเมืองเก่าระนอง.md',
  '13 แนวทางการพัฒนาพื้นที่ทุ่งน้อย ตาบลทุ่งน้อย อาเภอโพทะเล จังหวัดพิจิตร.md',
  '13_เล่มยลงานศิลป์เมืองฉะเชิงเทรา.md',
  '14 แนวทางการพัฒนาบึงกระดิ่ง ตาบลพยุหะ อาเภอพยุหะคีรี จังหวัดนครสวรรค์.md'
];

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 55000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data: { raw: data.substring(0, 200) } }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Client timeout')); });
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function processFile(file, fileIndex, total) {
  const enc = encodeURIComponent(file);
  const prefix = `[${fileIndex + 1}/${total}]`;
  console.log(`\n${prefix} === ${file} ===`);

  try {
    // Phase 1: Create resource
    console.log(`${prefix} Creating resource...`);
    const res1 = await httpGet(`${BASE}?file=${enc}&phase=resource`);
    if (res1.status !== 200 || !res1.data.resourceId) {
      console.log(`${prefix} ❌ Failed: ${JSON.stringify(res1.data).substring(0, 150)}`);
      return false;
    }
    const { totalBatches, totalChunks } = res1.data;
    console.log(`${prefix} ✅ Created (${totalChunks} chunks, ${totalBatches} batches)`);

    // Phase 2: Embed batch by batch
    for (let batch = 0; batch < totalBatches; batch++) {
      let retries = 3;
      let success = false;
      while (retries > 0 && !success) {
        try {
          const res2 = await httpGet(`${BASE}?file=${enc}&phase=embed&batch=${batch}&batchSize=3`);
          if (res2.status === 200 && res2.data.success) {
            console.log(`${prefix} ✅ batch ${batch+1}/${totalBatches}: ${res2.data.processedRange}`);
            success = true;
          } else {
            const err = JSON.stringify(res2.data).substring(0, 120);
            console.log(`${prefix} ⚠️ batch ${batch+1} (${res2.status}): ${err}`);
            retries--;
            if (retries > 0) {
              const wait = res2.data?.error?.includes('quota') ? 120 : 20;
              console.log(`${prefix} ⏳ Retry in ${wait}s (${retries} left)`);
              await sleep(wait * 1000);
            }
          }
        } catch (err) {
          console.log(`${prefix} ⚠️ Error: ${err.message}`);
          retries--;
          if (retries > 0) { console.log(`${prefix} ⏳ Retry in 20s`); await sleep(20000); }
        }
      }
      if (!success) {
        console.log(`${prefix} ❌ batch ${batch+1} FAILED — skipping file`);
        return false;
      }
      if (batch < totalBatches - 1) await sleep(5000); // 5s between batches
    }
    console.log(`${prefix} ✅✅ COMPLETE`);
    return true;
  } catch (err) {
    console.log(`${prefix} ❌ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  const total = REMAINING_FILES.length;
  const start = Date.now();
  console.log(`=== Resuming ingestion: Next chunk of 8 files (Third 25%) ===`);
  console.log(`Started: ${new Date().toLocaleTimeString()}\n`);

  const results = { success: [], failed: [] };
  for (let i = 0; i < total; i++) {
    const ok = await processFile(REMAINING_FILES[i], i, total);
    (ok ? results.success : results.failed).push(REMAINING_FILES[i]);
    if (i < total - 1) await sleep(7000); // 7s between files
  }

  const elapsed = Math.round((Date.now() - start) / 60000);
  console.log(`\n========== SUMMARY (${elapsed} min) ==========`);
  console.log(`✅ Success: ${results.success.length}/${total}`);
  console.log(`❌ Failed:  ${results.failed.length}/${total}`);
  if (results.failed.length > 0) {
    console.log('\nFailed files:');
    results.failed.forEach(f => console.log(`  - ${f}`));
  }
  console.log(`Finished: ${new Date().toLocaleTimeString()}`);
}

main();
