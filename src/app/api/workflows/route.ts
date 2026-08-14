import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'STUDENT') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workflows = await prisma.workflow.findMany({
      include: {
        department: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Fetch Workflows Error:", error);
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'STUDENT') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, data, departmentId } = await req.json();

    if (!title || !data) {
      return NextResponse.json({ error: "Title and Data are required" }, { status: 400 });
    }

    const newWorkflow = await prisma.workflow.create({
      data: {
        title,
        description,
        data,
        departmentId: departmentId || null
      }
    });

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error("Create Workflow Error:", error);
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
  }
}
