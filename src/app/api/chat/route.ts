import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { streamText, Message } from 'ai';
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

    // Fallback to keyword search in Prisma (No Google API needed!)
    const keywords = query.split(' ').filter(k => k.length > 2);
    const searchConditions = keywords.length > 0 
      ? keywords.map(k => ({ content: { contains: k, mode: 'insensitive' as const } }))
      : [{ content: { contains: query, mode: 'insensitive' as const } }];

    const similarResources = await prisma.resource.findMany({
      where: {
        OR: searchConditions,
        type: { in: ['TEXT', 'HTML'] }
      },
      take: 3,
      select: {
        title: true,
        content: true,
      }
    });

    // 3. Prepare the context from similar resources
    const contextText = similarResources.map(r => `Title: ${r.title}\nContent: ${r.content?.substring(0, 1000)}`).join('\n\n');

    // 4. Create the system prompt
    const systemPrompt = `คุณคือผู้ช่วย AI ชื่อ DOT Assistant สำหรับเว็บไซต์กรมการท่องเที่ยว (Department of Tourism)
หน้าที่ของคุณคือตอบคำถามของผู้ใช้โดยอิงจากข้อมูลบทเรียนหรือเนื้อหาในระบบเป็นหลัก
หากมีข้อมูลอ้างอิง ให้ตอบตามข้อมูลนั้น และแนบลิงก์ที่มา (Source) ให้ผู้ใช้ด้วยเสมอ
หากข้อมูลที่ค้นหามาไม่มีคำตอบ ให้ตอบว่า "ขออภัยครับ จากข้อมูลในระบบ ผมไม่พบคำตอบสำหรับคำถามนี้"
ห้ามแต่งเติมข้อมูลที่ไม่ได้มาจากกรมการท่องเที่ยวหรือข้อมูลที่ค้นหาเจอ

ข้อมูลที่เกี่ยวข้องสำหรับอ้างอิง:
${contextText}
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
