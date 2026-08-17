import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionRole = (session.user as any).role;
    if (sessionRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    const { role, departmentId } = await request.json();

    const allowedRoles = ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"];
    if (role && !allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(role ? { role } : {}),
        departmentId: departmentId === "" ? null : departmentId, // handle empty string as null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("PATCH /api/users/[id]/role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
