import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    order: z.number()
  }))
});

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = reorderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const { items } = result.data;
    
    const updatePromises = items.map((item) => 
      prisma.section.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    );

    await prisma.$transaction(updatePromises);

    return NextResponse.json({ success: true, message: "Sections reordered successfully" });
  } catch (error: any) {
    console.error("PUT Admin Sections Reorder error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
