import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  // TODO:
  // const chks = await prisma.checkup.findMany({
  //   where: { userId: session.userId, ...(date ? { checkupDate: date } : {}) },
  //   orderBy: { checkupDate: "desc" },
  // });
  console.log("[checkups GET]", session.userId, { date });

  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // TODO:
  // const chk = await prisma.checkup.create({
  //   data: { userId: session.userId, ...body },
  // });
  console.log("[checkups POST]", session.userId, body);

  return NextResponse.json({ ok: true }, { status: 201 });
}
