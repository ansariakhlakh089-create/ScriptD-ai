// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAndUpdateLimits } from '@/lib/user-limits';
import { performResearch, generateScript, generateVPrompts } from '@/lib/ai-models';
import { getCachedResearch, saveResearchToCache } from '@/lib/cache-logic';
import { estimateTaskCost } from '@/lib/model-registry';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-user-ip') || '127.0.0.1';
    const body = await req.json();
    const { userId, topic, type, tone, isNewChat } = body;

    // 1. User Verification & Limits Check (Part 3)
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    
    await checkAndUpdateLimits(userId, ip, isNewChat);
    const plan = user.plan as "FREE" | "PAID";

    // 2. Project DB Entry & Cost Estimation
    const estimatedCost = plan === "PAID" ? estimateTaskCost("SCRIPT", plan, 1000) : 0;
    
    // Paid users ke liye credit validation
    if (plan === "PAID" && user.credits < estimatedCost) {
      return NextResponse.json({ success: false, message: `Insufficient credits. Need approx ${estimatedCost} credits.` }, { status: 403 });
    }

    const project = await db.project.create({
      data: {
        userId,
        topic,
        scriptType: type,
        tone,
        status: 'RESEARCHING', // Pehla step
        estimatedCost
      }
    });

    // 3. Paid plan walo ka temporary token deduction (Agar API fail hui toh wapas milenge)
    if (plan === "PAID") {
      await db.user.update({
        where: { id: userId },
        data: { credits: { decrement: estimatedCost } }
      });
    }

    // 4. Background Execution Trigger (Fire and Forget)
    // Dhyan dein: Production me lambe tasks ke liye Inngest, QStash, ya Next.js 15 ka `after()` function use karein taaki server timeout na ho.
    runMasterPipeline(project.id, userId, topic, type, tone, plan, estimatedCost, isNewChat);

    // Frontend ko turant Project ID bhej do taaki UI polling (status check) shuru kar sake
    return NextResponse.json({ success: true, projectId: project.id });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

/**
 * Ye function background me chalega aur status update karega
 */
async function runMasterPipeline(
  projectId: string, userId: string, topic: string, type: string, tone: string, 
  plan: "FREE" | "PAID", estimatedCost: number, isNewChat: boolean
) {
  try {
    // STEP 1: RESEARCH (Perplexity) & CACHE CHECK
    let researchFacts = "";
    let researchLinks = null;
    
    const cachedData = await getCachedResearch(topic);
    if (cachedData) {
      researchFacts = cachedData.facts;
      researchLinks = cachedData.links;
      console.log(`Cache hit for topic: ${topic}`);
    } else {
      console.log(`Fetching new research for: ${topic}`);
      const rawResearch = await performResearch(topic, plan);
      // Demo parsing logic (Actual response ke hisaab se extract karein)
      researchFacts = rawResearch; 
      researchLinks = { sources: ["extracted_link_1", "extracted_link_2"] }; // JSON dummy
      
      // Save anonymized data to global cache
      await saveResearchToCache(topic, researchFacts, researchLinks);
    }

    // Update DB: Roadmap Done (Chat tab me dikhane ke liye)
    await db.project.update({
      where: { id: projectId },
      data: { status: 'SCRIPTING', roadmap: researchFacts }
    });

    // STEP 2: SCRIPT GENERATION (Groq / Claude)
    const generatedScript = await generateScript(topic, type, tone, researchFacts, plan);
    
    // Parse Title, Description, Tags from AI response (assuming AI is instructed to use identifiers like TITLE:, SCRIPT:, DESC:)
    // Ek basic extraction logic:
    const titleMatch = generatedScript.match(/TITLE:\s*(.*)/);
    const finalTitle = titleMatch ? titleMatch[1] : `${topic} Script`;

    await db.project.update({
      where: { id: projectId },
      data: { 
        status: 'VPROMPTING', 
        script: generatedScript,
        title: finalTitle 
      }
    });

    // STEP 3: VISUAL PROMPTS (Grok / Gemini)
    const vPromptsJson = await generateVPrompts(generatedScript, plan);

    // STEP 4: FINAL QUALITY CHECK & DONE
    await db.project.update({
      where: { id: projectId },
      data: { 
        status: 'DONE', 
        vPrompts: vPromptsJson 
      }
    });

  } catch (error: any) {
    console.error(`Pipeline Failed for Project ${projectId}:`, error);
    
    // ROLLBACK LOGIC: Tokens wapas karna aur Limits adjust karna
    await db.project.update({
      where: { id: projectId },
      data: { status: 'ERROR' }
    });

    if (plan === "PAID") {
      // Credits refund
      await db.user.update({
        where: { id: userId },
        data: { credits: { increment: estimatedCost } }
      });
    } else {
      // Free plan limit wapas karna (kyunki fail ho gaya toh quota nahi katna chahiye)
      await db.user.update({
        where: { id: userId },
        data: { 
          chatsToday: isNewChat ? { decrement: 1 } : undefined,
          messagesToday: !isNewChat ? { decrement: 1 } : undefined
        }
      });
    }
  }
}
  
