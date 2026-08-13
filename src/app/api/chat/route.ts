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
        SELECT title, content, 1 - (embedding <=> ${embedding}::vector) as similarity
        FROM "ResourceEmbedding"
        WHERE 1 - (embedding <=> ${embedding}::vector) > 0.5
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
      take: 10
    });
    const coursesText = availableCourses.map(c => `- ${c.title}: ${c.description || 'ไม่มีคำอธิบาย'}`).join('\n');

    // Fetch Quizzes to provide exam information
    const availableQuizzes = await prisma.quiz.findMany({
      select: { title: true, passScore: true, section: { select: { course: { select: { title: true } } } } },
      take: 10
    });
    const quizzesText = availableQuizzes.map(q => `- บททดสอบ: "${q.title}" (ในหลักสูตร: ${q.section?.course?.title}) ต้องผ่านที่คะแนน ${q.passScore}%`).join('\n');

    // Fetch FAQs for Knowledge Hub Integration
    const availableFaqs = await prisma.fAQ.findMany({
      include: { department: { select: { name: true } } },
      take: 10
    });
    const faqsText = availableFaqs.map(f => `- Q: ${f.question} (ตอบโดย ${f.department?.name || 'ทั่วไป'})\n  A: ${f.answer}`).join('\n\n');

    // 3. Prepare the context from similar resources
    const contextText = similarResources.map(r => `Title: ${r.title}\nContent: ${r.content?.substring(0, 1000)}`).join('\n\n');

    // 4. Create the system prompt
    const systemPrompt = `คุณคือผู้ช่วย AI ชื่อ Mr. Wick สำหรับ DOT Knowledge & Learning Hub ของกรมการท่องเที่ยว
หน้าที่ของคุณคือแนะนำหลักสูตร ตอบคำถามการปฏิบัติงาน และข้อมูลทั่วไปของกรม
ให้ตอบคำถามอย่างเป็นมิตร สุภาพ และกระตือรือร้น

ข้อมูลหลักสูตรที่มีในระบบ:
${coursesText}

ข้อมูลแบบทดสอบ/ข้อสอบที่มีในระบบ:
${quizzesText}

คลังคำถาม-ตอบเกี่ยวกับการปฏิบัติงาน (FAQ):
${faqsText || 'ยังไม่มีคำถาม-ตอบในระบบ'}

ข้อมูลอ้างอิงเพิ่มเติมจากเอกสาร/บทเรียน (RAG Context):
${contextText || 'ไม่มีข้อมูลอ้างอิงในส่วนนี้'}

คำแนะนำในการตอบ:
1. หากผู้ใช้ถามเกี่ยวกับ "ข้อสอบ" ให้อ้างอิงจากข้อมูลแบบทดสอบ
2. หากผู้ใช้ถามเกี่ยวกับการปฏิบัติงาน ให้ใช้ข้อมูลใน "คลังคำถาม-ตอบ" หรือ "ข้อมูลอ้างอิงเพิ่มเติม"
3. หากคำถามเป็นเรื่องทั่วไปเกี่ยวกับการท่องเที่ยว สามารถตอบจากความรู้พื้นฐานของคุณได้
4. หากผู้ใช้ถามคำถามการทำงานที่คุณไม่มีคำตอบในคลัง ให้แนะนำว่า "คุณสามารถส่งคำถามตรงถึงเจ้าของงานได้ผ่านเมนู Cross-Dept Q&A ครับ"
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
