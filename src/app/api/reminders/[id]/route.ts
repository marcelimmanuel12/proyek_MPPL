import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // TODO: await prisma.reminder.update({ where: { id, userId: session.userId }, data: body });
  console.log("[reminders PATCH]", id, body);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // TODO: await prisma.reminder.delete({ where: { id, userId: session.userId } });
  console.log("[reminders DELETE]", id);

  return NextResponse.json({ ok: true });
}
