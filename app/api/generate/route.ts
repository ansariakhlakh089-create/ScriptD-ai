import { NextResponse } from 'next/server';
import { callPerplexity, callGroqScript, callGeminiVisuals } from '@/lib/ai-models';

export async function POST(req: Request) {
  const { userQuery, plan, tone } = await req.json();
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (step: string, status: string, content: string = "") => {
        controller.enqueue(encoder.encode(`DATA: ${JSON.stringify({ step, status, content })}\n`));
      };

      try {
        // --- STEP 1: RESEARCH ---
        sendData('research', 'loading');
        const research = await callPerplexity(userQuery);
        sendData('research', 'done', research);

        // --- STEP 2: SCRIPT ---
        sendData('script', 'loading');
        const script = await callGroqScript(research, tone);
        sendData('script', 'done', script);

        // --- STEP 3: VISUALS ---
        sendData('visuals', 'loading');
        const visuals = await callGeminiVisuals(script);
        sendData('visuals', 'done', visuals);

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
