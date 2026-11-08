import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

// import { db } from '../../../lib/db'; // Jab database connect hoga tab use karenge

export async function POST(req: Request) {
  const { userQuery, topic, type, tone } = await req.json();
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (step: string, status: string, content: string = "") => {
        controller.enqueue(encoder.encode(`DATA: ${JSON.stringify({ step, status, content })}\n`));
      };

      try {
        // STEP 1: RESEARCH & ROADMAP
        sendData('research', 'loading');
        await new Promise(r => setTimeout(r, 2000)); // Dummy wait
        const dummyResearch = `Research for "${userQuery}" (${type}, ${tone}).\n\nSources:\n1. Wikipedia\n2. History.com`;
        sendData('research', 'done', dummyResearch);
        
        // Chat mein auto-message bhejne ke liye
        sendData('chat_msg', 'done', "Aapki script taiyar ho rahi hai, kuch seconds rukiye...");

        // STEP 2: SCRIPT (Auto-start after research)
        sendData('script', 'loading');
        sendData('status', 'working'); // Upar "Working" icon dikhane ke liye
        
        // Yahan Credits deduct karne ka logic aayega
        // await db.user.update({ data: { credits: { decrement: 1 } } });

        await new Promise(r => setTimeout(r, 3000)); // Dummy writing time
        const dummyScript = `Title: The Untold Story of ${userQuery}\n\n[Visual: Wide shot of subject]\nScript starts here. This is a ${tone} script...\n\n[Visual: Document screenshot of 1800s]\nMore script...\n\nTags: #history #${topic}`;
        sendData('script', 'done', dummyScript);
        
        // Chat mein auto-message: Script ready
        sendData('chat_msg', 'done', "✅ Script ready hai! Upar Script tab par click karein.");

        // STEP 3: V-PROMPT (Auto-start after script)
        sendData('vprompt', 'loading');
        await new Promise(r => setTimeout(r, 2000));
        const dummyVPrompt = `Scene 1: [IMAGE_PROMPT] Generate a cinematic wide shot of ${userQuery}.\n\nScene 2: [DOCUMENT_NEEDED] Search for the original patent of 1879 and show screenshot.`;
        sendData('vprompt', 'done', dummyVPrompt);
        
        sendData('status', 'done'); // Sab kaam khatam, working icon hatao
        controller.close();
        
      } catch (error) {
        // Agar error aaya, toh credits refund karne ka logic yahan aayega
        sendData('error', 'done', 'Error aagya bhai, credits wapas kar diye hain.');
        controller.close();
      }
    }
  });

  return new NextResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}
