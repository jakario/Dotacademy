import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const department = await prisma.department.findUnique({
      where: { id: params.id },
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({ department });
  } catch (error: any) {
    console.error("GET /api/departments/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, description, icon } = body;

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name,
        description,
        icon,
      },
    });

    return NextResponse.json({ department });
  } catch (error: any) {
    console.error("PUT /api/departments/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.department.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/departments/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
