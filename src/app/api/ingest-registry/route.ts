import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results: any = {};

    // 1. Find the department
    const dept = await prisma.department.findFirst({
      where: {
        name: {
          contains: 'ทะเบียนธุรกิจนำเที่ยว'
        }
      }
    });
    results.dept = dept ? { id: dept.id, name: dept.name } : null;

    // 2. Add / Upsert documents into KM Library (Document table)
    const docsToInsert = [
      {
        title: 'พระราชบัญญัติธุรกิจนำเที่ยวและมัคคุเทศก์ พ.ศ. 2551 และที่แก้ไขเพิ่มเติม (ฉบับที่ 2) พ.ศ. 2559',
        type: 'PDF',
        url: '/pdfs/registry/tourism_act_2551_2559.pdf',
        category: 'กฎหมาย/ระเบียบ',
        departmentId: dept?.id || null,
      },
      {
        title: 'คู่มือสร้างความเข้าใจ การประกาศกำหนดเขตพื้นที่เพื่อการท่องเที่ยวในท้องถิ่นหรือชุมชน',
        type: 'PDF',
        url: '/pdfs/registry/designated_area_manual.pdf',
        category: 'คู่มือการปฏิบัติงาน',
        departmentId: dept?.id || null,
      }
    ];

    // Remove old versions of these documents if exist
    for (const doc of docsToInsert) {
      await prisma.document.deleteMany({
        where: {
          url: doc.url
        }
      });
      const created = await prisma.document.create({
        data: doc
      });
      results[doc.url] = created.id;
    }

    // 3. Update Section 2 in Course
    const sectionId = 'cmsr6jrd5000667gwqg4yrvbn';
    const resources = await prisma.resource.findMany({
      where: { sectionId: sectionId },
      orderBy: { order: 'asc' }
    });

    results.resourceCount = resources.length;

    const registryHeaderHtml = `
<div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #16a34a; border-radius: 16px; padding: 24px; margin-bottom: 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
    <span style="font-size: 2rem;">📜</span>
    <div>
      <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #14532d;">กฎหมายและคู่มือปฏิบัติงาน กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์</h3>
      <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #15803d; font-weight: 500;">เอกสารอ้างอิงและคู่มือสำคัญในการกำกับดูแลและพัฒนาการท่องเที่ยวในท้องถิ่น</p>
    </div>
  </div>
  <p style="color: #334155; font-size: 0.9rem; line-height: 1.6; margin-bottom: 16px;">
    ผู้เรียนสามารถคลิกที่ชื่อเอกสารเพื่อเปิดอ่านหรือดาวน์โหลดเอกสาร PDF ฉบับเต็ม เพื่อใช้ประกอบการเรียนรู้และนำไปใช้อ้างอิงในการปฏิบัติงานจริง:
  </p>
  <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
    <li style="margin-bottom: 0;">
      <a href="/pdfs/registry/tourism_act_2551_2559.pdf" target="_blank" rel="noopener noreferrer" download="พระราชบัญญัติธุรกิจนำเที่ยวและมัคคุเทศก์.pdf" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; color: #1e293b; text-decoration: none; font-size: 0.92rem; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.borderColor='#16a34a'; this.style.backgroundColor='#f0fdf4';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.backgroundColor='#ffffff';">
        <span style="display: flex; align-items: center; gap: 10px;">
          <span style="color: #ef4444; font-weight: bold; font-size: 0.8rem; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">PDF</span>
          <span>พระราชบัญญัติธุรกิจนำเที่ยวและมัคคุเทศก์ พ.ศ. 2551 และที่แก้ไขเพิ่มเติม (ฉบับที่ 2) พ.ศ. 2559</span>
        </span>
        <span style="color: #16a34a; font-size: 0.85rem; font-weight: 700; white-space: nowrap; margin-left: 12px;">ดาวน์โหลด ⬇</span>
      </a>
    </li>
    <li style="margin-bottom: 0;">
      <a href="/pdfs/registry/designated_area_manual.pdf" target="_blank" rel="noopener noreferrer" download="คู่มือการประกาศกำหนดเขตพื้นที่เพื่อการท่องเที่ยวในท้องถิ่นหรือชุมชน.pdf" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; color: #1e293b; text-decoration: none; font-size: 0.92rem; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.borderColor='#16a34a'; this.style.backgroundColor='#f0fdf4';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.backgroundColor='#ffffff';">
        <span style="display: flex; align-items: center; gap: 10px;">
          <span style="color: #ef4444; font-weight: bold; font-size: 0.8rem; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">PDF</span>
          <span>คู่มือสร้างความเข้าใจ การประกาศกำหนดเขตพื้นที่เพื่อการท่องเที่ยวในท้องถิ่นหรือชุมชน</span>
        </span>
        <span style="color: #16a34a; font-size: 0.85rem; font-weight: 700; white-space: nowrap; margin-left: 12px;">ดาวน์โหลด ⬇</span>
      </a>
    </li>
  </ul>
</div>
<hr style="border: 0; border-top: 2px dashed #94a3b8; margin: 28px 0;" />
`;

    if (resources.length > 0) {
      const firstRes = resources[0];
      let cleanContent = firstRes.content || '';

      // Strip any previous injected registry header
      if (cleanContent.includes('กฎหมายและคู่มือปฏิบัติงาน กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์')) {
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

      const updatedContent = registryHeaderHtml + cleanContent;
      const updated = await prisma.resource.update({
        where: { id: firstRes.id },
        data: {
          content: updatedContent,
          type: 'HTML'
        }
      });
      results.updatedResource = { id: updated.id, title: updated.title, type: updated.type };
    }

    return NextResponse.json({
      success: true,
      message: 'Registry documents ingested and section 2 updated successfully',
      results
    });
  } catch (error: any) {
    console.error('Ingest registry error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || String(error)
    }, { status: 500 });
  }
}
