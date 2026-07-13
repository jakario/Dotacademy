import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all reward claims (for admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = await (prisma as any).rewardClaim.findMany({
      orderBy: { claimedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    });

    return NextResponse.json({ success: true, claims });
  } catch (error: any) {
    console.error("GET RewardClaims error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
