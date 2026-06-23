import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const log = await prisma.monitoringLog.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return NextResponse.json(log ?? null);
}
