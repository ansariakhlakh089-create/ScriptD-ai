// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    // Real app mein userId session ya JWT token se aayegi.
    // Example: const session = await getSession(); const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || "user_id_here"; 

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        plan: true,
        credits: true,
        chatsToday: true,
        messagesToday: true,
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
