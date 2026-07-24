import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export async function writeAuditLog(params: {
  userId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details
        ? (params.details as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
