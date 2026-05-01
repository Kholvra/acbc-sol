import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    authSecret: {
      set: !!process.env.AUTH_SECRET,
      length: process.env.AUTH_SECRET?.length ?? 0,
    },
    databaseUrl: {
      set: !!process.env.DATABASE_URL,
      prefix: process.env.DATABASE_URL?.slice(0, 30) ?? null,
    },
    nodeEnv: process.env.NODE_ENV,
  });
}
