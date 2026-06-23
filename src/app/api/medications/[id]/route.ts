import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const med = await prisma.medication.updateMany({
    where: { id, userId: session.userId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.dosage !== undefined && { dosage: body.dosage }),
      ...(body.times_per_day !== undefined && { timesPerDay: body.times_per_day }),
      ...(body.schedule_times !== undefined && { scheduleTimes: body.schedule_times }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.active !== undefined && { active: body.active }),
    },
  });

  return NextResponse.json(med);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.medication.deleteMany({ where: { id, userId: session.userId } });

  return NextResponse.json({ ok: true });
}
