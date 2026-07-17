import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { embed } from 'ai';
import { google } from '@/lib/ai';

// Simple HTML stripper for cleaning resource content before embedding
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

export async function POST() {
  try {
    // 1. Fetch resources that don't have embeddings yet
    const resources = await prisma.resource.findMany({
      where: {
        embedding: null,
        type: {
          in: ['TEXT', 'HTML']
        },
        content: {
          not: null
        }
      },
      include: {
        section: {
          include: {
            course: true
          }
        }
      },
      take: 20 // Process in batches
    });

    if (resources.length === 0) {
      return NextResponse.json({ message: 'No new resources to embed.' });
    }

    const results = [];

    for (const resource of resources) {
      if (!resource.content) continue;
      
      const cleanContent = stripHtml(resource.content);
      if (cleanContent.length < 10) continue; // Skip too short

      // Create a contextual text for embedding
      const contextualText = `Course: ${resource.section.course.title}\nSection: ${resource.section.title}\nTopic: ${resource.title}\nContent: ${cleanContent}`;

      // 2. Generate embedding using Google Generative AI (text-embedding-004)
      const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: contextualText,
      });

      // 3. Save to database using raw SQL for the vector field
      await prisma.$executeRaw`
        INSERT INTO "ResourceEmbedding" ("id", "resourceId", "content", "embedding", "createdAt")
        VALUES (
          gen_random_uuid()::text,
          ${resource.id},
          ${contextualText},
          ${embedding}::vector,
          NOW()
        )
      `;

      results.push({ id: resource.id, title: resource.title });
    }

    return NextResponse.json({ 
      message: `Embedded ${results.length} resources`,
      results 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
