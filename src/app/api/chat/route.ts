import { NextResponse } from 'next/server';
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
    const { messages } = await req.json();

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage?.content || '';

    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    // 1. Generate an embedding for the user's query using Google
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: query,
    });

    // 2. Search for similar resources in the database
    // Ensure you have pgvector configured in your DB and prisma
    const similarResources = await prisma.$queryRaw<Array<{ title: string; content: string; url: string; similarity: number }>>`
      SELECT title, content, url, 1 - (embedding <=> ${embedding}::vector) as similarity
      FROM "ResourceEmbedding"
      WHERE 1 - (embedding <=> ${embedding}::vector) > 0.5
      ORDER BY similarity DESC
      LIMIT 3
    `;

    // 3. Prepare the context from similar resources
    const contextText = similarResources.map(r => `Title: ${r.title}\nContent: ${r.content}\nSource: ${r.url}`).join('\n\n');

    // 4. Create the system prompt
    const systemPrompt = `คุณคือผู้ช่วย AI ชื่อ DOT Assistant สำหรับเว็บไซต์กรมการท่องเที่ยว (Department of Tourism)
หน้าที่ของคุณคือตอบคำถามของผู้ใช้โดยอิงจากข้อมูลบทเรียนหรือเนื้อหาในระบบเป็นหลัก
หากมีข้อมูลอ้างอิง ให้ตอบตามข้อมูลนั้น และแนบลิงก์ที่มา (Source) ให้ผู้ใช้ด้วยเสมอ
หากข้อมูลที่ค้นหามาไม่มีคำตอบ ให้ตอบว่า "ขออภัยครับ จากข้อมูลในระบบ ผมไม่พบคำตอบสำหรับคำถามนี้"
ห้ามแต่งเติมข้อมูลที่ไม่ได้มาจากกรมการท่องเที่ยวหรือข้อมูลที่ค้นหาเจอ

ข้อมูลที่เกี่ยวข้องสำหรับอ้างอิง:
${contextText}
    `;

    // 5. Generate and stream the response using Groq (Llama 3 70B)
    const result = await streamText({
      model: groq('llama3-70b-8192'),
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
