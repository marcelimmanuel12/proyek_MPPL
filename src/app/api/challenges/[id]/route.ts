import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // TODO: await prisma.userChallenge.delete({ where: { id, userId: session.userId } });
  console.log("[challenges DELETE]", id);

  return NextResponse.json({ ok: true });
}
