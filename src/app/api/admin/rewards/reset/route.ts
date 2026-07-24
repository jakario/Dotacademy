import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all reward claims
    const result = await (prisma as any).rewardClaim.deleteMany({});
    
    // Audit log
    await logAudit({
      action: "RESET_ALL_REWARDS",
      userId: (session.user as any).id,
      entity: "RewardClaim",
      details: { deletedCount: result.count }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
