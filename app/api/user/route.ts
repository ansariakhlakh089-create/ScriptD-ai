import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    name: "Ansar", 
    plan: "FREE", 
    tokens: 3000 
  });
}
