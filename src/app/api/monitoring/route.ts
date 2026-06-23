import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 100);
  const since = searchParams.get("since");

  const logs = await prisma.monitoringLog.findMany({
    where: {
      userId: session.userId,
      ...(since ? { createdAt: { gte: new Date(since) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const log = await prisma.monitoringLog.create({
    data: {
      userId: session.userId,
      mood: body.mood,
      ateBreakfast: body.ate_breakfast ?? false,
      ateLunch: body.ate_lunch ?? false,
      ateDinner: body.ate_dinner ?? false,
      exercised: body.exercised ?? false,
      waterGlasses: body.water_glasses ?? 0,
      sleepHours: body.sleep_hours ?? 7,
      symptoms: body.symptoms,
      notes: body.notes,
      aiFeedback: body.ai_feedback,
    },
  });

  return NextResponse.json(log, { status: 201 });
}
