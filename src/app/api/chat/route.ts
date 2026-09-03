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

    // Fetch all published courses to always provide general course information
    const availableCourses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { title: true, description: true },
      take: 50
    });
    const coursesText = availableCourses.map(c => `- ${c.title}: ${c.description || 'ไม่มีคำอธิบาย'}`).join('\n');

    // Fetch Quizzes to provide exam information
    const availableQuizzes = await prisma.quiz.findMany({
      select: { title: true, passScore: true, section: { select: { course: { select: { title: true } } } } },
      take: 50
    });
    const quizzesText = availableQuizzes.map(q => `- บททดสอบ: "${q.title}" (ในหลักสูตร: ${q.section?.course?.title}) ต้องผ่านที่คะแนน ${q.passScore}%`).join('\n');

    // Fetch FAQs for Knowledge Hub Integration
    const availableFaqs = await prisma.fAQ.findMany({
      include: { department: { select: { name: true } } },
      take: 50
    });
    const faqsText = availableFaqs.map(f => `- Q: ${f.question} (ตอบโดย ${f.department?.name || 'ทั่วไป'})\n  A: ${f.answer}`).join('\n\n');

    // Fetch Departments for Knowledge Hub Integration
    const availableDepartments = await prisma.department.findMany({
      select: { name: true, description: true, duties: true },
      take: 50
    });
    const deptsText = availableDepartments.map(d => `- หน่วยงาน: ${d.name}\n  ภารกิจ: ${d.description || 'ไม่มี'}\n  อำนาจหน้าที่:\n${d.duties || 'ไม่มีข้อมูลระบุ'}`).join('\n\n');

    // Fetch KM Documents / Standards Manuals for Knowledge Hub Integration
    const availableDocs = await prisma.document.findMany({
      select: { title: true, category: true, url: true },
      take: 100
    });
    const docsText = availableDocs.map(d => `- [${d.category}] ${d.title} (ดาวน์โหลดได้ที่: ${d.url})`).join('\n');

    // 3. Prepare the context from similar resources
    const contextText = similarResources.map(r => `Title: ${r.title}\nContent: ${r.content?.substring(0, 1000)}`).join('\n\n');

    // 4. Create the system prompt
    const systemPrompt = `คุณคือผู้ช่วย AI ชื่อ Mr. Wick สำหรับ DOT Knowledge & Learning Hub ของกรมการท่องเที่ยว
คุณมีหน้าที่ตอบคำถามอย่างสุภาพ ชัดเจน และอิงจากข้อมูลที่มีอยู่ในระบบเท่านั้น หากไม่รู้หรือไม่แน่ใจให้ตอบว่าไม่ทราบ

ข้อมูลหลักสูตรทั้งหมดที่มีในระบบ:
${coursesText}

ข้อมูลหน่วยงานและอำนาจหน้าที่ในกรมการท่องเที่ยว:
${deptsText}

ข้อมูลแบบทดสอบทั้งหมดที่มีในระบบ:
${quizzesText}

ข้อมูลคำถามที่พบบ่อย (FAQ):
${faqsText || 'ยังไม่มีคำถาม-ตอบในระบบ'}

ข้อมูลเอกสารคู่มือมาตรฐานคุณภาพแหล่งท่องเที่ยวและคลังความรู้ (KM Library):
${docsText || 'ยังไม่มีเอกสารในระบบ'}

ความรู้เฉพาะทางด้านมาตรฐานคุณภาพแหล่งท่องเที่ยว (กองพัฒนาแหล่งท่องเที่ยว กรมการท่องเที่ยว):
1. มาตรฐานคุณภาพแหล่งท่องเที่ยว แบ่งตามประเภทหลัก:
   - แหล่งท่องเที่ยวเชิงนิเวศ (Eco-tourism): เน้นการอนุรักษ์ระบบนิเวศ ความหลากหลายทางชีวภาพ การมีส่วนร่วมของชุมชนท้องถิ่น และการให้ความรู้ด้านการอนุรักษ์
   - แหล่งท่องเที่ยวทางธรรมชาติ: ครอบคลุม ธรณีสัณฐาน, น้ำตก, ถ้ำ, แก่ง, เกาะ, ชายหาด เน้นความปลอดภัย การจัดการสิ่งแวดล้อม และการรักษาสภาพธรรมชาติ
   - แหล่งท่องเที่ยวทางประวัติศาสตร์และวัฒนธรรม: เน้นคุณค่าทางโบราณคดี ความถูกต้องทางประวัติศาสตร์ การอนุรักษ์ และการบริหารจัดการท่องเที่ยวที่ไม่ทำลายมรดก
   - แหล่งท่องเที่ยวเชิงเกษตร: วิถีเกษตรปลอดภัย การเรียนรู้ การแปรรูปผลิตภัณฑ์ และสุขอนามัย
   - แหล่งท่องเที่ยวเชิงสุขภาพ (น้ำพุร้อนธรรมชาติ): คุณภาพน้ำ มาตรฐานความปลอดภัย สุขลักษณะ และบริการที่ส่งเสริมสุขภาพ
   - แหล่งท่องเที่ยวประเภทนันทนาการและศิลปะวิทยาการ: ความปลอดภัย กิจกรรมเสริมการเรียนรู้
   - แหล่งท่องเที่ยวเชิงสร้างสรรค์ (Creative Tourism): เน้นประสบการณ์ตรงที่นักท่องเที่ยวได้ลงมือปฏิบัติ (Hands-on Experience) ร่วมกับเจ้าของวัฒนธรรม
2. เกณฑ์การประเมินมาตรฐานความยั่งยืน 4 มิติ:
   - ด้านการบริหารจัดการอย่างยั่งยืน (Sustainable Management)
   - ด้านเศรษฐกิจและสังคมที่ชุมชนได้รับประโยชน์ (Socio-Economic Benefits)
   - ด้านวัฒนธรรมและการอนุรักษ์มรดกท้องถิ่น (Cultural Heritage)
   - ด้านสิ่งแวดล้อมและการใช้ทรัพยากรอย่างคุ้มค่า (Environmental Sustainability) รวมถึงการคำนึงถึงขีดความสามารถในการรองรับ (Carrying Capacity) และสิ่งอำนวยความสะดวกตามหลักอารยสถาปัตย์ (Universal Design)

ข้อมูลอ้างอิงเพิ่มเติมจากเอกสาร/บทเรียน (RAG Context):
${contextText || 'ไม่มีข้อมูลอ้างอิงในส่วนนี้'}

คำแนะนำในการตอบ:
1. หากผู้ใช้ถามเกี่ยวกับ "ข้อสอบ" ให้อ้างอิงจากข้อมูลแบบทดสอบ
2. หากผู้ใช้ถามเกี่ยวกับการปฏิบัติงาน ให้ใช้ข้อมูลใน "คลังคำถาม-ตอบ" หรือ "ข้อมูลอ้างอิงเพิ่มเติม"
3. หากผู้ใช้ถามเกี่ยวกับ "มาตรฐานคุณภาพแหล่งท่องเที่ยว", "เกณฑ์การประเมิน", "การท่องเที่ยวเชิงนิเวศ/สร้างสรรค์" หรือ "คู่มือกองแหล่ง" ให้ตอบโดยสรุปหลักเกณฑ์สำคัญตาม 4 มิติ และประเภทของแหล่งท่องเที่ยว พร้อมทั้งแนะนำชื่อคู่มือและแนบลิงก์ดาวน์โหลดไฟล์ PDF จาก KM Library ให้ผู้ใช้ทันที
4. หากคำถามเป็นเรื่องทั่วไปเกี่ยวกับการท่องเที่ยว สามารถตอบจากความรู้พื้นฐานของคุณได้
5. หากผู้ใช้ถามคำถามการทำงานที่คุณไม่มีคำตอบในคลัง ให้แนะนำว่า "คุณสามารถส่งคำถามตรงถึงเจ้าของงานได้ผ่านเมนู Cross-Dept Q&A ครับ"
    `;

    // 5. Generate and stream the response using Groq (Llama 3.3 70B)
    const result = await streamText({
      model: groq('openai/gpt-oss-120b'),
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
