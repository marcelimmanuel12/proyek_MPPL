import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // TODO:
  // await prisma.userChallenge.update({
  //   where: { id, userId: session.userId },
  //   data: { progressDays: body.progress_days, completed: body.completed },
  // });
  console.log("[challenges checkin]", id, body);

  return NextResponse.json({ ok: true });
}
