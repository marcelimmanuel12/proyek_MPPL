import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO:
  // const posts = await prisma.forumPost.findMany({
  //   orderBy: { createdAt: "desc" },
  //   take: 50,
  // });
  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // TODO:
  // const post = await prisma.forumPost.create({
  //   data: { userId: session.userId, ...body },
  // });
  console.log("[forum POST]", session.userId, body);

  return NextResponse.json({ ok: true }, { status: 201 });
}
