import { NextResponse } from "next/server";
import { salvarResposta } from "@/lib/db";

export async function POST(req: Request) {
    const data = await req.json();
    salvarResposta(data);
    return NextResponse.json({ success: true });
}
