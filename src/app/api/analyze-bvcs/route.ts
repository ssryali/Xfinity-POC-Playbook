import { NextResponse } from "next/server";
import { requestBVCSNudge } from "@/lib/writer";

export const dynamic = "force-dynamic";

type AnalyzeRequest = {
  strategicInput?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const strategicInput = typeof body.strategicInput === "string" ? body.strategicInput.trim() : "";

    if (!strategicInput) {
      return NextResponse.json({ error: "Strategic Input is required." }, { status: 400 });
    }

    const result = await requestBVCSNudge(strategicInput);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ANALYZE-BVCS] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to analyze Strategic Input." },
      { status: 500 },
    );
  }
}
