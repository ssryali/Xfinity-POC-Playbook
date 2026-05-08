import { NextResponse } from "next/server";
import { requestCreativeNudge } from "@/lib/writer";

export const dynamic = "force-dynamic";

type AnalyzeRequest = {
  strategicInput?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const strategicInput = typeof body.strategicInput === "string" ? body.strategicInput.trim() : "";

    console.log("[ANALYZE] nudgeType: Source of Growth Identification");
    console.log("[ANALYZE] strategicInput received:", strategicInput.slice(0, 200));

    if (!strategicInput) {
      return NextResponse.json({ error: "Strategic Input is required." }, { status: 400 });
    }

    const result = await requestCreativeNudge(strategicInput);

    console.log("[ANALYZE] Response to client:", JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ANALYZE] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to analyze Strategic Input." },
      { status: 500 },
    );
  }
}
