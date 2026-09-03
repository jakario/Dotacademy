import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const courseId = 'cmsr6jrd5000367gw0wyi1qx4';
    const sectionId = 'cmsr6jrd5000767gwswe3f5hr';

    // Validate section
    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });

    const pdfFiles = [
      '1.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวเชิงนิเวศ.pdf',
      '2.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติประเภทธรณีสัณฐาน.pdf',
      '3.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวประเภทน้ำตก.pdf',
      '4.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางประวัติศาสตร์.pdf',
      '5.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติประเภทแก่ง.pdf',
      '6.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวประเภทนันทนาการ.pdf',
      '7.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวเชิงเกษตร (ใหม่).pdf',
      '8.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติ.pdf',
      '9.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติประเภทเกาะ.pdf',
      '10.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวประเภทชายหาด.pdf',
      '11.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางวัฒนธรรม.pdf',
      '12.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวเชิงสุขภาพประเภทน้ำพุร้อนธรรมชาติ (ใหม่).pdf',
      '13.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางธรรมชาติประเภทถ้ำ.pdf',
      '14.คู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวทางศิลปะวิทยาการ.pdf',
      '15.แนวทางการบริหารจัดการแหล่งท่องเที่ยว ประเภท นิเวศ ประวัติศาสตร์ และวัฒนธรรม.pdf',
      '16.คู่มือการจัดการแหล่งท่องเที่ยวสิ่งอำนวยความสะดวกและองค์ประกอบทางกายภาพ.pdf',
      '17.คู่มือการบริหารจัดการแหล่งท่องเที่ยวเชิงสร้างสรรค์.pdf',
      'คู่มือเกณฑ์การประเมินความยั่งยืนสำหรับท.pdf',
      'คู่มือเกณฑ์การประเมินมาตรฐานยั่งยืนสำหร.pdf',
      'คู่มือเกณฑ์การประเมินมาตรฐานยั่งยืนสำหร0.pdf',
      'คู่มือเกณฑ์การประเมินสำหรับชุมชนท่องเที.pdf'
    ];

    let newContent = `<h2>📚 คู่มือมาตรฐานคุณภาพแหล่งท่องเที่ยว (อัปเดตใหม่)</h2><p>ผู้เรียนสามารถดาวน์โหลดคู่มือการประเมินมาตรฐานคุณภาพแหล่งท่องเที่ยวประเภทต่างๆ เพื่อใช้เป็นแนวทางในการพัฒนาและบริหารจัดการแหล่งท่องเที่ยวได้อย่างยั่งยืน ตามแนวทางของกรมการท่องเที่ยว:</p><ul>`;
    for (const file of pdfFiles) {
      newContent += `<li><a href="/pdfs/standards/${encodeURIComponent(file)}" target="_blank" rel="noopener noreferrer">${file.replace('.pdf', '')}</a></li>`;
    }
    newContent += `</ul><hr/><br/>`;

    // Fetch existing resources in this section
    const resources = await prisma.resource.findMany({
      where: { sectionId: sectionId },
      orderBy: { order: 'asc' }
    });

    if (resources.length > 0) {
      // Find the first TEXT or HTML resource to prepend to, OR just prepend to the very first resource if it's text
      const firstRes = resources[0];
      if (firstRes.type === 'HTML' || firstRes.type === 'TEXT') {
         const updatedContent = newContent + (firstRes.content || '');
         await prisma.resource.update({ where: { id: firstRes.id }, data: { content: updatedContent }});
      } else {
         // Create a new resource at order -1
         await prisma.resource.create({
           data: {
             title: 'ดาวน์โหลดคู่มือมาตรฐานคุณภาพ',
             type: 'HTML',
             content: newContent,
             sectionId: sectionId,
             order: -1
           }
         });
      }
    } else {
       await prisma.resource.create({
           data: {
             title: 'ดาวน์โหลดคู่มือมาตรฐานคุณภาพ',
             type: 'HTML',
             content: newContent,
             sectionId: sectionId,
             order: 1
           }
       });
    }

    let kmAdded = 0;
    for (const file of pdfFiles) {
      const exists = await prisma.document.findFirst({ where: { url: `/pdfs/standards/${encodeURIComponent(file)}` }});
      if (!exists) {
        await prisma.document.create({
          data: {
            title: file.replace('.pdf', ''), type: 'PDF',
            url: `/pdfs/standards/${encodeURIComponent(file)}`, category: 'มาตรฐานแหล่งท่องเที่ยว'
          }
        });
        kmAdded++;
      }
    }
    return NextResponse.json({ success: true, message: 'Resource prepended & KM added', kmAdded });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
