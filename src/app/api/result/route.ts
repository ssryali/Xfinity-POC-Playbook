import { NextResponse } from "next/server";
import { getCreativeNudgeResult } from "@/lib/writer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId")?.trim();

    if (!threadId) {
      return NextResponse.json({ error: "Writer thread ID is required." }, { status: 400 });
    }

    const result = await getCreativeNudgeResult(threadId);

    console.log("[RESULT] threadId:", threadId);
    console.log("[RESULT] hasFinalOutput:", result.hasFinalOutput, "| status:", result.status);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[RESULT] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch Creative Nudge." },
      { status: 500 },
    );
  }
}
