import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userQuery, plan, tone } = await req.json();
  
  const encoder = new TextEncoder();
  
  // Streaming setup
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (step: string, status: string, content: string = "") => {
        controller.enqueue(encoder.encode(`DATA: ${JSON.stringify({ step, status, content })}\n`));
      };

      try {
        // --- STEP 1: RESEARCH ---
        sendData('research', 'loading');
        await new Promise(r => setTimeout(r, 2000)); // 2 second ka wait (Dummy)
        sendData('research', 'done', `Research complete for: ${userQuery}. Found 5 sources.`);

        // --- STEP 2: SCRIPT ---
        sendData('script', 'loading');
        await new Promise(r => setTimeout(r, 3000)); // 3 second ka wait
        const dummyScript = `This is a ${tone} script about ${userQuery}. It has a strong hook and is perfectly optimized for your video.`;
        sendData('script', 'done', dummyScript);

        // --- STEP 3: VISUALS ---
        sendData('visuals', 'loading');
        await new Promise(r => setTimeout(r, 3000)); 
        const dummyVisuals = `Scene 1 (0-10s): Wide shot of ${userQuery}.\nScene 2 (10-20s): Close up shot with dramatic lighting.`;
        sendData('visuals', 'done', dummyVisuals);

        controller.close();
      } catch (error) {
        sendData('error', 'done', 'Something went wrong');
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
