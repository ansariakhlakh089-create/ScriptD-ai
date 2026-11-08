// lib/cache-logic.ts
import { db } from './db';

export const getCachedResearch = async (topic: string) => {
  // Topic ko thoda normalize kar lenge taki "AI in 2026" aur "ai in 2026" match ho jaye
  const normalizedTopic = topic.toLowerCase().trim();

  const cache = await db.researchCache.findUnique({
    where: { topic: normalizedTopic }
  });

  if (cache) {
    return {
      facts: cache.perplexityData,
      links: cache.sourceLinks
    };
  }

  return null; // Agar cache nahi mila, toh naya Perplexity API call hoga
};

export const saveResearchToCache = async (topic: string, data: string, links: any) => {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Upsert use karenge taki duplicate entry ki error na aaye
  await db.researchCache.upsert({
    where: { topic: normalizedTopic },
    update: {}, // Agar pehle se hai toh chhod do
    create: {
      topic: normalizedTopic,
      perplexityData: data,
      sourceLinks: links
    }
  });
};
