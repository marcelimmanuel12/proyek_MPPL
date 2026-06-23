import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, profile: { select: { fullName: true } } },
  });
  if (!user) return NextResponse.json(null, { status: 401 });

  return NextResponse.json({
    user: { id: user.id, email: user.email, full_name: user.profile?.fullName ?? null },
  });
}
