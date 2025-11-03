import { NextResponse } from "next/server";
import { lerRespostas } from "@/lib/db";

export async function GET() {
    return NextResponse.json(lerRespostas());
}
