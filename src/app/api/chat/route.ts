import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { embed, streamText } from 'ai';
import { google } from '@/lib/ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Extract the latest message from the user
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage || latestMessage.role !== 'user') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const query = latestMessage.content;

    // 1. Generate an embedding for the user's query
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: query,
    });

    // 2. Search for the most relevant course materials using cosine similarity (<=>)
    const contextResults = await prisma.$queryRaw<
      Array<{ content: string; distance: number }>
    >`
      SELECT content, 1 - (embedding <=> ${embedding}::vector) AS distance
      FROM "ResourceEmbedding"
      ORDER BY embedding <=> ${embedding}::vector
      LIMIT 3;
    `;

    // 3. Format the retrieved context
    const contextText = contextResults
      .map((result) => result.content)
      .join('\n\n---\n\n');

    // 4. Create the system prompt
    const systemPrompt = `
      คุณคือ "DOT AI" ผู้ช่วยอัจฉริยะของ กรมการท่องเที่ยว (Department of Tourism) 
      หน้าที่ของคุณคือการตอบคำถามเกี่ยวกับการท่องเที่ยวและบทเรียนใน DOT Academy อย่างเป็นมิตรและถูกต้อง
      
      กรุณาใช้ข้อมูลอ้างอิงต่อไปนี้ในการตอบคำถาม:
      ${contextText ? contextText : 'ไม่มีข้อมูลอ้างอิงเฉพาะเจาะจงในระบบ'}

      กฎ:
      1. ถ้าข้อมูลอ้างอิงมีคำตอบ ให้ตอบตามข้อมูลอ้างอิงนั้น
      2. ถ้าข้อมูลอ้างอิงไม่มีคำตอบ ให้บอกผู้ใช้ตามตรงว่า "ขออภัยครับ/ค่ะ ยังไม่มีข้อมูลในส่วนนี้ในบทเรียนปัจจุบัน" และสามารถให้ความรู้ทั่วไปเกี่ยวกับการท่องเที่ยวของไทยได้
      3. ตอบด้วยภาษาไทยที่สุภาพ อ่านง่าย และมีการเว้นวรรคย่อหน้าให้เหมาะสม
    `;

    // 5. Generate and stream the response using Gemini 1.5 Flash
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: messages,
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
