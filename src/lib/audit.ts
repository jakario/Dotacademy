import { prisma } from "@/lib/prisma";

export async function logAudit({
  action,
  userId,
  entity,
  entityId,
  details,
  ipAddress
}: {
  action: string;
  userId?: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      }
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}
