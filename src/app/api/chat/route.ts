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

    // Fetch KM Documents / Standards Manuals (Tourism Standards)
    const availableDocs = await prisma.document.findMany({
      select: { title: true, url: true },
      take: 25
    });
    const docsText = availableDocs.map(d => `- ${d.title} (ดาวน์โหลด: ${d.url})`).join('\n');

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

คู่มือมาตรฐานคุณภาพแหล่งท่องเที่ยว (KM Library):
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
2. เกณฑ์การประเมินมาตรฐานความยั่งยืน 4 มิติ:
   - การบริหารจัดการอย่างยั่งยืน, เศรษฐกิจ-สังคมชุมชน, วัฒนธรรมมรดกท้องถิ่น, สิ่งแวดล้อม (Carrying Capacity และ Universal Design)

${contextText ? `ข้อมูลอ้างอิงเพิ่มเติม:\n${contextText}\n` : ''}
แนวทางการตอบ:
1. หากผู้ใช้ถามเรื่องข้อสอบ ให้แนะนำเกณฑ์ผ่านและเนื้อหาแบบทดสอบ
2. หากผู้ใช้ถามเกี่ยวกับ "มาตรฐานคุณภาพแหล่งท่องเที่ยว", "เกณฑ์การประเมิน", "การท่องเที่ยวเชิงนิเวศ/สร้างสรรค์" หรือ "คู่มือกองแหล่ง" ให้อธิบายหลักเกณฑ์สำคัญตาม 4 มิติ และประเภทของแหล่งท่องเที่ยว พร้อมทั้งระบุชื่อคู่มือและแนบลิงก์ดาวน์โหลดไฟล์ PDF จาก KM Library ให้ผู้ใช้ได้ดาวน์โหลดทันที
3. หากคำถามเป็นเรื่องทั่วไปเกี่ยวกับการท่องเที่ยว สามารถตอบจากความรู้พื้นฐานได้
4. หากเป็นคำถามเฉพาะงานที่ไม่มีในระบบ แนะนำให้ส่งคำถามตรงผ่านเมนู Cross-Dept Q&A
    `;

    // 5. Generate and stream the response using Groq (Llama 3.3 70B)
    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: messages,
    });

    return result.toDataStreamResponse();

  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
