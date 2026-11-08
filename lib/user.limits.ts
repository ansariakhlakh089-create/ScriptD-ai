// lib/user-limits.ts
import { db } from './db';

export const checkAndUpdateLimits = async (userId: string, clientIp: string, isNewChat: boolean) => {
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error("User not found.");

  // 1. Email Verification Check (Fake accounts rokne ke liye)
  if (!user.emailVerified) {
    throw new Error("Pehle apna email verify karein taaki hum bot spam rok sakein.");
  }

  const now = new Date();
  const lastReset = new Date(user.lastResetDate);
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

  let { chatsToday, messagesToday } = user;

  // 2. 24-Hour Reset Logic
  if (hoursSinceReset >= 24) {
    chatsToday = 0;
    messagesToday = 0;
    await db.user.update({
      where: { id: userId },
      data: { 
        chatsToday: 0, 
        messagesToday: 0, 
        lastResetDate: now,
        lastIpAddress: clientIp // Update IP on new day
      }
    });
  }

  // 3. Free Plan Limits Check
  if (user.plan === "FREE") {
    if (isNewChat && chatsToday >= 3) {
      throw new Error("Free plan ki limit khatam. 24 ghante baad try karein ya Paid plan lein.");
    }
    // Agar chat ke andar message kar raha hai (Max 5 messages per day free)
    if (!isNewChat && messagesToday >= 5) {
      throw new Error("Free plan mein daily 5 messages ki limit cross ho gayi hai.");
    }
  }

  // 4. Update Limits for Current Request
  await db.user.update({
    where: { id: userId },
    data: {
      chatsToday: isNewChat ? chatsToday + 1 : chatsToday,
      messagesToday: !isNewChat ? messagesToday + 1 : messagesToday,
      lastIpAddress: clientIp // IP hamesha track hoti rahegi
    }
  });

  return true;
};
