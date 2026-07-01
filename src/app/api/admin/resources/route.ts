import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const resourceSchema = z.object({
  sectionId: z.string().min(1, "Section ID is required"),
  title: z.string().min(1, "Title is required").optional(),
  type: z.enum(["TEXT", "VIDEO", "PDF", "IMAGE", "HTML"]).optional(),
  content: z.string().optional(),
});

export async function POST(request: Request) {
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
    const result = resourceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { sectionId, title, type, content } = result.data;
    const newResource = await prisma.resource.create({
      data: {
        title: title || "บทเรียนใหม่",
        type: type || "TEXT",
        content: content || "",
        sectionId
      }
    });

    return NextResponse.json({ success: true, resource: newResource });
  } catch (error: any) {
    console.error("POST Admin Resource error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
