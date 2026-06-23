import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") === "true";

  const meds = await prisma.medication.findMany({
    where: { userId: session.userId, ...(activeOnly ? { active: true } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(meds);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const med = await prisma.medication.create({
    data: {
      userId: session.userId,
      name: body.name,
      dosage: body.dosage,
      timesPerDay: body.times_per_day ?? 1,
      scheduleTimes: body.schedule_times ?? [],
      notes: body.notes,
      active: body.active ?? true,
    },
  });

  return NextResponse.json(med, { status: 201 });
}
