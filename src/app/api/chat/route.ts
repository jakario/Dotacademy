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

    // Fetch all published courses to always provide general course information
    const availableCourses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { title: true, description: true },
      take: 10
    });

    const coursesText = availableCourses.map(c => `- ${c.title}: ${c.description || 'ไม่มีคำอธิบาย'}`).join('\n');

    // 3. Prepare the context from similar resources
    const contextText = similarResources.map(r => `Title: ${r.title}\nContent: ${r.content?.substring(0, 1000)}`).join('\n\n');

    // 4. Create the system prompt
    const systemPrompt = `คุณคือผู้ช่วย AI ชื่อ Mr.Wick สำหรับเว็บไซต์เรียนรู้ออนไลน์ของกรมการท่องเที่ยว (DOT Academy)
หน้าที่ของคุณคือแนะนำหลักสูตร ตอบคำถามเกี่ยวกับบทเรียน และการท่องเที่ยวไทย
ให้ตอบคำถามอย่างเป็นมิตร สุภาพ และกระตือรือร้น

ข้อมูลหลักสูตรทั้งหมดที่มีในระบบ:
${coursesText}

ข้อมูลบทเรียนที่เกี่ยวข้องกับคำถามนี้:
${contextText || 'ไม่มีข้อมูลบทเรียนที่ตรงกับคำถามในตอนนี้'}

คำแนะนำในการตอบ:
1. หากผู้ใช้ถามว่า "มีเรียนอะไรบ้าง" ให้สรุปรายชื่อหลักสูตรที่มีในระบบให้ฟัง
2. หากมีข้อมูลในส่วน "ข้อมูลบทเรียนที่เกี่ยวข้อง" ให้นำมาอ้างอิงในการตอบ
3. หากคำถามเป็นเรื่องทั่วไปเกี่ยวกับการท่องเที่ยว สามารถตอบจากความรู้พื้นฐานของคุณได้
4. หากไม่ทราบจริงๆ ให้ตอบว่า "ขออภัยครับ ตอนนี้ผมยังไม่มีข้อมูลในส่วนนี้ แต่คุณสามารถเลือกดูหลักสูตรอื่นๆ ของเราได้ครับ"
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
