import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { embed, embedMany } from 'ai';
import { google } from '@/lib/ai';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds

function chunkText(text: string, maxLen: number = 2000): string[] {
  const chunks: string[] = [];
  // simple chunking by double newlines or headers
  const paragraphs = text.split(/\n\s*\n|\n#+\s/);
  let currentChunk = '';

  for (const p of paragraphs) {
    if ((currentChunk.length + p.length) > maxLen && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += p + '\n\n';
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      // Return list of available files
      const dirPath = path.join(process.cwd(), 'public', 'md', 'tourism_routes');
      if (!fs.existsSync(dirPath)) return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
      return NextResponse.json({ files });
    }

    const filePath = path.join(process.cwd(), 'public', 'md', 'tourism_routes', fileName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Sanitize null bytes which cause PostgreSQL error 22000
    content = content.replace(/\0/g, '');
    
    // Convert to HTML briefly for display in resource (since type='HTML' is supported)
    // We don't have marked imported in this file yet, we can just save it as TEXT and let frontend handle it or simple replace
    const htmlContent = content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\n\n/gim, '<br><br>');

    const title = fileName.replace('.md', '').replace(/^[0-9A-Z_-]+\s*/, '');

    // Target Section ID: cmsr6jrd5000767gwswe3f5hr (ตอนที่ 3: กองพัฒนาแหล่งท่องเที่ยว)
    const sectionId = 'cmsr6jrd5000767gwswe3f5hr';

    // 1. Create or Update Resource
    let resource = await prisma.resource.findFirst({
      where: { title, sectionId }
    });

    if (!resource) {
      const lastRes = await prisma.resource.findFirst({
        where: { sectionId },
        orderBy: { order: 'desc' }
      });
      const nextOrder = lastRes ? lastRes.order + 1 : 1;
      
      resource = await prisma.resource.create({
        data: {
          title,
          type: 'HTML',
          content: `<div class="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6"><h2 class="text-xl font-bold text-blue-800">📖 บทความ: ${title}</h2></div><div class="prose max-w-none">${htmlContent}</div>`,
          sectionId,
          order: nextOrder
        }
      });
    }

    // 2. Clear old embeddings
    await prisma.$executeRaw`DELETE FROM "ResourceEmbedding" WHERE "resourceId" = ${resource.id}`;

    // 3. Chunk and Embed
    const chunks = chunkText(content, 2000);
    const results = [];
    
    // Process in smaller batches to avoid AI limits
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const contextualBatch = batch.map(c => `Topic: ${title}\nContent: ${c}`);
      
      const { embeddings } = await embedMany({
        model: google.textEmbeddingModel('gemini-embedding-2'),
        values: contextualBatch,
      });

      for (let j = 0; j < embeddings.length; j++) {
        await prisma.$executeRaw`
          INSERT INTO "ResourceEmbedding" ("id", "resourceId", "content", "embedding", "createdAt")
          VALUES (
            gen_random_uuid()::text,
            ${resource.id},
            ${contextualBatch[j]},
            ${JSON.stringify(embeddings[j])}::vector,
            NOW()
          )
        `;
      }
      results.push(...embeddings);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Ingested ${fileName}`,
      resourceId: resource.id,
      chunksEmbedded: results.length
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
