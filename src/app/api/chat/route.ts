import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { prisma } from '@/lib/prisma';
import { embed, streamText, Message } from 'ai';
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

// Initialize Groq provider using OpenAI SDK wrapper
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Rate Limit Check
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await checkRateLimit(`chat_${ip}`, 10, 60000); // 10 requests per minute
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { messages } = await req.json();

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage?.content || '';

    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    // 1. Generate an embedding for the user's query using Google
    let similarResources: Array<{ title: string; content: string; similarity: number }> = [];
    try {
      const { embedding } = await embed({
        model: google.textEmbeddingModel('gemini-embedding-2'),
        value: query,
      });

      // 2. Search for similar resources in the database (Vector Search)
      similarResources = await prisma.$queryRaw<Array<{ title: string; content: string; similarity: number }>>`
        SELECT r.title, re.content, 1 - (re.embedding <=> ${embedding}::vector) as similarity
        FROM "ResourceEmbedding" re
        JOIN "Resource" r ON r.id = re."resourceId"
        WHERE 1 - (re.embedding <=> ${embedding}::vector) > 0.5
        ORDER BY similarity DESC
        LIMIT 3
      `;
    } catch (embeddingError) {
      console.warn("Embedding failed, falling back to basic prompt injection. Error:", embeddingError);
      // Fallback: Continue without RAG context
    }

    // Fetch top published courses
    const availableCourses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { title: true },
      take: 10
    });
    const coursesText = availableCourses.map(c => `- ${c.title}`).join('\n');

    // Fetch top Quizzes
    const availableQuizzes = await prisma.quiz.findMany({
      select: { title: true, passScore: true, section: { select: { course: { select: { title: true } } } } },
      take: 10
    });
    const quizzesText = availableQuizzes.map(q => `- ${q.title} (${q.section?.course?.title}): ผ่านเกณฑ์ ${q.passScore}%`).join('\n');

    // Fetch FAQs
    const availableFaqs = await prisma.fAQ.findMany({
      include: { department: { select: { name: true } } },
      take: 8
    });
    const faqsText = availableFaqs.map(f => `- Q: ${f.question}\n  A: ${f.answer?.substring(0, 150)}`).join('\n');

    // Fetch Departments
    const availableDepartments = await prisma.department.findMany({
      select: { name: true, description: true },
      take: 8
    });
    const deptsText = availableDepartments.map(d => `- ${d.name}: ${d.description || 'หน่วยงานในสังกัดกรมการท่องเที่ยว'}`).join('\n');

    // Fetch KM Documents / Standards Manuals / Registry Manuals
    const availableDocs = await prisma.document.findMany({
      select: { title: true },
      take: 50
    });
    const docsText = availableDocs.map(d => `- ${d.title}`).join('\n');

    // 3. Prepare the context from similar resources
    const contextText = similarResources.map(r => `Title: ${r.title}\nContent: ${r.content?.substring(0, 500)}`).join('\n\n');

    // 4. Create the system prompt
    const systemPrompt = `คุณคือผู้ช่วย AI ชื่อ Mr. Wick ประจำระบบ DOT Knowledge & Learning Hub ของกรมการท่องเที่ยว
ตอบคำถามอย่างกระชับ สุภาพ ชัดเจน และเป็นมิตร อ้างอิงข้อมูลของกรมการท่องเที่ยว

ข้อมูลหลักสูตรในระบบ:
${coursesText}

ข้อมูลหน่วยงานในกรมการท่องเที่ยว:
${deptsText}

ข้อมูลแบบทดสอบ:
${quizzesText}

ข้อมูลคำถามที่พบบ่อย (FAQ):
${faqsText || 'ไม่มีคำถามพบบ่อย'}

เอกสารและคู่มือในคลังความรู้ (KM Library):
${docsText || 'สามารถดูได้ที่คลังความรู้ KM Library'}

ความรู้เฉพาะทางด้านมาตรฐานคุณภาพแหล่งท่องเที่ยว (กองพัฒนาแหล่งท่องเที่ยว กรมการท่องเที่ยว):
1. ประเภทมาตรฐานคุณภาพแหล่งท่องเที่ยว:
   - เชิงนิเวศ (Eco-tourism): การอนุรักษ์ระบบนิเวศ ความหลากหลายทางชีวภาพ การมีส่วนร่วมของชุมชนท้องถิ่น และการให้ความรู้ด้านการอนุรักษ์
   - ทางธรรมชาติ: ธรณีสัณฐาน, น้ำตก, ถ้ำ, แก่ง, เกาะ, ชายหาด เน้นความปลอดภัย การจัดการสิ่งแวดล้อม และการรักษาสภาพธรรมชาติ
   - ทางประวัติศาสตร์และวัฒนธรรม: คุณค่าทางโบราณคดี ความถูกต้องทางประวัติศาสตร์ และการท่องเที่ยวที่ไม่ทำลายมรดก
   - เชิงเกษตร: วิถีเกษตรปลอดภัย การเรียนรู้ การแปรรูปผลิตภัณฑ์
   - เชิงสุขภาพ (น้ำพุร้อนธรรมชาติ): คุณภาพน้ำ มาตรฐานความปลอดภัย และสุขลักษณะ
   - นันทนาการและศิลปะวิทยาการ: ความปลอดภัยและกิจกรรมเสริมการเรียนรู้
   - เชิงสร้างสรรค์ (Creative Tourism): ประสบการณ์ตรงที่นักท่องเที่ยวได้ลงมือปฏิบัติจริง (Hands-on) ร่วมกับชุมชน
2. เกณฑ์การประเมินมาตรฐานความยั่งยืน 4 มิติ (สรุปกระชับ):
   - มิติที่ 1 ด้านการบริหารจัดการอย่างยั่งยืน: โครงสร้างการบริหาร แผนพัฒนา และการติดตามประเมินผล
   - มิติที่ 2 ด้านเศรษฐกิจและสังคม: การกระจายรายได้สู่ชุมชน และการมีส่วนร่วมของคนในท้องถิ่น
   - มิติที่ 3 ด้านวัฒนธรรมและมรดกท้องถิ่น: การอนุรักษ์วิถีชีวิต ภูมิปัญญา และอัตลักษณ์ท้องถิ่น
   - มิติที่ 4 ด้านสิ่งแวดล้อม: การอนุรักษ์ทรัพยากรธรรมชาติ ควบคุม Carrying Capacity และจัดทำสิ่งอำนวยความสะดวกตามหลัก Universal Design

ความรู้เฉพาะทางด้านธุรกิจนำเที่ยวและมัคคุเทศก์ (กองทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์ กรมการท่องเที่ยว):
1. พระราชบัญญัติธุรกิจนำเที่ยวและมัคคุเทศก์ พ.ศ. 2551 และที่แก้ไขเพิ่มเติม (ฉบับที่ 2) พ.ศ. 2559:
   - วัตถุประสงค์: จัดระเบียบ คุ้มครองนักท่องเที่ยว และส่งเสริมมาตรฐานผู้ประกอบธุรกิจนำเที่ยว มัคคุเทศก์ และผู้นำเที่ยว
   - การประกอบธุรกิจนำเที่ยว: ต้องได้รับใบอนุญาต มี 4 ประเภท (เฉพาะพื้นที่, ภายในประเทศ, นำเที่ยวจากต่างประเทศ/Inbound, ทั่วไป/Outbound) ใบอนุญาตมีอายุ 2 ปี มีการวางเงินหลักประกันตามกฎหมาย
   - มัคคุเทศก์: บุคคลธรรมดาที่ทำหน้าที่นำนักท่องเที่ยวไปยังสถานที่ต่างๆ ต้องมีสัญชาติไทย อายุไม่ต่ำกว่า 18 ปี ผ่านการอบรมและได้รับใบอนุญาตมัคคุเทศก์ (อายุ 5 ปี)
   - มัคคุเทศก์ท้องถิ่น (Local Guide): ตามมาตรา 51 วรรคสอง ให้ปฏิบัติหน้าที่เฉพาะในเขตพื้นที่เพื่อการท่องเที่ยวในท้องถิ่นหรือชุมชน เพื่อส่งเสริมอาชีพและเศรษฐกิจฐานรากในชุมชน
   - ผู้นำเที่ยว (Tour Leader): ผู้ทำหน้าที่ดูแลนักท่องเที่ยวไทยที่เดินทางไปต่างประเทศ ต้องได้รับใบรับรองผู้นำเที่ยว
   - สำนักงานทะเบียนธุรกิจนำเที่ยวและมัคคุเทศก์: มีส่วนกลาง และสำนักงานสาขาประจำภูมิภาค 8 สาขา ทั่วประเทศ
2. เกณฑ์การประกาศกำหนดเขตพื้นที่เพื่อการท่องเที่ยวในท้องถิ่นหรือชุมชน 4 องค์ประกอบ:
   - องค์ประกอบที่ 1 ด้านทรัพยากรการท่องเที่ยว: มีความโดดเด่น อัตลักษณ์ ประวัติศาสตร์ หรือธรรมชาติ และมีขอบเขตพื้นที่ชัดเจน
   - องค์ประกอบที่ 2 ด้านแผนงานการผลิตและพัฒนามัคคุเทศก์ท้องถิ่น: มีแผนการฝึกอบรมและพัฒนาทักษะมัคคุเทศก์ท้องถิ่นในพื้นที่
   - องค์ประกอบที่ 3 ด้านการรวมกลุ่มและการมีส่วนร่วมของชุมชน: ประชาชนในท้องถิ่นมีส่วนร่วม มีกลุ่มองค์กรที่เข้มแข็งและเห็นชอบร่วมกัน
   - องค์ประกอบที่ 4 ด้านการบริหารจัดการที่มีแผนและกระบวนการที่ดี: มีแผนแม่บท กฎระเบียบชุมชน ระบบความปลอดภัย การจัดการสิ่งแวดล้อม และการกระจายรายได้อย่างเป็นธรรม

${contextText ? `ข้อมูลอ้างอิงเพิ่มเติม:\n${contextText}\n` : ''}
แนวทางการตอบ:
- ตอบเป็นภาษาไทยทันที สั้น กระชับ สุภาพ ตรงประเด็น ไม่ต้องเกริ่นนำยืดยาว
- หากถามเรื่อง "เกณฑ์การประเมิน 4 มิติ" ให้ตอบสรุป 4 มิติของแหล่งท่องเที่ยว พร้อมบอกว่าดาวน์โหลดคู่มือได้ที่ KM Library หรือหน้าบทเรียน
- หากถามเรื่อง "พ.ร.บ. ธุรกิจนำเที่ยวและมัคคุเทศก์", "มัคคุเทศก์ท้องถิ่น" หรือ "เกณฑ์ 4 องค์ประกอบการประกาศเขตพื้นที่ท่องเที่ยวชุมชน" ให้ตอบสรุปข้อสำคัญชัดเจน พร้อมแนะนำว่าสามารถดาวน์โหลด พ.ร.บ. และคู่มือฉบับเต็มได้ที่เมนู "คลังความรู้ (KM Library)" หรือหน้าบทเรียนตอนที่ 2
- จัดข้อความให้อ่านง่าย เว้นบรรทัดสะอาดตา
    `;

    // 5. Generate and stream the response using Groq (GPT-OSS 120B - Direct conversational model, zero thinking tags)
    const result = await streamText({
      model: groq('openai/gpt-oss-120b'),
      system: systemPrompt,
      messages: messages.slice(-5),
      maxTokens: 800,
    });

    return result.toDataStreamResponse();

  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
