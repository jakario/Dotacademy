import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sectionId = 'cmsr6jrd5000767gwswe3f5hr';

    const standardsList = [
      { id: 'standard_01.pdf', title: '1. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวเชิงนิเวศ' },
      { id: 'standard_02.pdf', title: '2. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติประเภทธรณีสัณฐาน' },
      { id: 'standard_03.pdf', title: '3. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวประเภทน้ำตก' },
      { id: 'standard_04.pdf', title: '4. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางประวัติศาสตร์' },
      { id: 'standard_05.pdf', title: '5. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติประเภทแก่ง' },
      { id: 'standard_06.pdf', title: '6. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวประเภทนันทนาการ' },
      { id: 'standard_07.pdf', title: '7. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวเชิงเกษตร (ใหม่)' },
      { id: 'standard_08.pdf', title: '8. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติ' },
      { id: 'standard_09.pdf', title: '9. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติประเภทเกาะ' },
      { id: 'standard_10.pdf', title: '10. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวประเภทชายหาด' },
      { id: 'standard_11.pdf', title: '11. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางวัฒนธรรม' },
      { id: 'standard_12.pdf', title: '12. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวเชิงสุขภาพประเภทน้ำพุร้อนธรรมชาติ (ใหม่)' },
      { id: 'standard_13.pdf', title: '13. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติประเภทถ้ำ' },
      { id: 'standard_14.pdf', title: '14. คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางศิลปะวิทยาการ' },
      { id: 'standard_15.pdf', title: '15. แนวทางการบริหารจัดการแหล่งท่องเที่ยว ประเภท นิเวศ ประวัติศาสตร์ และวัฒนธรรม' },
      { id: 'standard_16.pdf', title: '16. คู่มือการจัดการแหล่งท่องเที่ยวสิ่งอำนวยความสะดวกและองค์ประกอบทางกายภาพ' },
      { id: 'standard_17.pdf', title: '17. คู่มือการบริหารจัดการแหล่งท่องเที่ยวเชิงสร้างสรรค์' },
      { id: 'standard_18.pdf', title: '18. คู่มือเกณฑ์การประเมินความยั่งยืนสำหรับแหล่งท่องเที่ยว' },
      { id: 'standard_19.pdf', title: '19. คู่มือเกณฑ์การประเมินมาตรฐานยั่งยืนสำหรับการท่องเที่ยว' },
      { id: 'standard_20.pdf', title: '20. คู่มือเกณฑ์การประเมินมาตรฐานยั่งยืนสำหรับองค์กร' },
      { id: 'standard_21.pdf', title: '21. คู่มือเกณฑ์การประเมินสำหรับชุมชนท่องเที่ยว' }
    ];

    // 1. Build beautiful styled HTML box for the course section
    let listItemsHtml = standardsList.map(s => `
      <li style="margin-bottom: 8px;">
        <a href="/pdfs/standards/${s.id}" target="_blank" rel="noopener noreferrer" download="${s.title}.pdf" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; color: #1e293b; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'; this.style.backgroundColor='#eff6ff';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.backgroundColor='#ffffff';">
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #ef4444; font-weight: bold; font-size: 0.8rem; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">PDF</span>
            <span>${s.title}</span>
          </span>
          <span style="color: #2563eb; font-size: 0.8rem; font-weight: 600; white-space: nowrap; margin-left: 12px;">ดาวน์โหลด ⬇</span>
        </a>
      </li>
    `).join('');

    const newHeaderHtml = `
<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0284c7; border-radius: 16px; padding: 24px; margin-bottom: 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
    <span style="font-size: 2rem;">📚</span>
    <div>
      <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #0c4a6e;">คู่มือมาตรฐานคุณภาพแหล่งท่องเที่ยว (อัปเดตใหม่ 21 ฉบับ)</h3>
      <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #0369a1; font-weight: 500;">กองพัฒนาแหล่งท่องเที่ยว กรมการท่องเที่ยว</p>
    </div>
  </div>
  <p style="color: #334155; font-size: 0.9rem; line-height: 1.6; margin-bottom: 16px;">
    ผู้เรียนสามารถคลิกที่ชื่อคู่มือเพื่อเปิดอ่านหรือดาวน์โหลดเอกสาร PDF ฉบับเต็ม เพื่อใช้ประกอบการเรียนรู้และนำไปใช้อ้างอิงในการปฏิบัติงานจริง:
  </p>
  <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 10px;">
    ${listItemsHtml}
  </ul>
</div>
<hr style="border: 0; border-top: 2px dashed #94a3b8; margin: 28px 0;" />
`;

    // 2. Fetch resource in this section
    const resources = await prisma.resource.findMany({
      where: { sectionId: sectionId },
      orderBy: { order: 'asc' }
    });

    if (resources.length > 0) {
      const firstRes = resources[0];
      let cleanContent = firstRes.content || '';
      
      // Strip any previous injected standards header
      if (cleanContent.includes('คู่มือมาตรฐานคุณภาพแหล่งท่องเที่ยว')) {
        const parts = cleanContent.split(/<hr[^>]*\/?>(?:<br\s*\/?>)?/i);
        if (parts.length > 1) {
          cleanContent = parts.slice(1).join('<hr/>').trim();
        } else {
          const ulIdx = cleanContent.indexOf('</ul>');
          if (ulIdx !== -1) {
            cleanContent = cleanContent.substring(ulIdx + 5).replace(/^<hr\s*\/?>|<br\s*\/?>/gi, '').trim();
          }
        }
      }

      const updatedContent = newHeaderHtml + cleanContent;
      await prisma.resource.update({
        where: { id: firstRes.id },
        data: { 
          content: updatedContent,
          type: 'HTML' // Set type to HTML so it renders properly!
        }
      });
    }

    // 3. Update Document table (KM Library) with clean ASCII URLs
    await prisma.document.deleteMany({
      where: { category: 'มาตรฐานแหล่งท่องเที่ยว' }
    });

    for (const item of standardsList) {
      await prisma.document.create({
        data: {
          title: item.title,
          type: 'PDF',
          url: `/pdfs/standards/${item.id}`,
          category: 'มาตรฐานแหล่งท่องเที่ยว'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully updated course section with styled HTML and updated KM library with clean standard_XX.pdf URLs'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
