import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") === "true";

  const rems = await prisma.reminder.findMany({
    where: { userId: session.userId, ...(activeOnly ? { active: true } : {}) },
    orderBy: { reminderTime: "asc" },
  });

  return NextResponse.json(rems);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const rem = await prisma.reminder.create({
    data: {
      userId: session.userId,
      type: body.type,
      title: body.title,
      reminderTime: body.reminder_time,
      reminderDate: body.reminder_date,
      recurring: body.recurring ?? "daily",
      notes: body.notes,
      active: body.active ?? true,
    },
  });

  return NextResponse.json(rem, { status: 201 });
}
