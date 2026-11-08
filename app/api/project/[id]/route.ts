import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await db.project.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        roadmap: true,
        script: true,
        title: true,
        vPrompts: true,
      }
    });

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
