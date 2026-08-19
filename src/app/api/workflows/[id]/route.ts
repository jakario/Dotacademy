import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'STUDENT') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, data, departmentId } = await req.json();

    const updatedWorkflow = await prisma.workflow.update({
      where: { id },
      data: {
        title,
        description,
        data,
        departmentId: departmentId || null
      }
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error("Update Workflow Error:", error);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'STUDENT') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.workflow.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Workflow Error:", error);
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}
