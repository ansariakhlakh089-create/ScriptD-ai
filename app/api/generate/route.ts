// app/api/generate/route.ts (Updated snippet)
import { checkAndUpdateLimits } from '@/lib/user-limits';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-user-ip') || 'unknown';
    const body = await req.json();
    const { userId, isNewChat } = body;

    // Yahan check hoga: IP Rate limit, Email Verify, aur 3 Chats/5 Msgs limit
    await checkAndUpdateLimits(userId, ip, isNewChat);

    // Agar sab pass ho gaya toh aage ka AI logic chalega...
    // runAIPipeline(...)

  } catch (error: any) {
    // Agar limit cross hui toh token nahi kategi aur error dikhayega
    return NextResponse.json({ success: false, message: error.message }, { status: 403 });
  }
}
