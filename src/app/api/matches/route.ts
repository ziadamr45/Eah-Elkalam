import { NextResponse } from "next/server";
import { MOCK_MATCHES } from "@/lib/trend-radar/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    let matches = [...MOCK_MATCHES];

    // Filter by status if provided
    if (statusParam) {
      const validStatuses = ["live", "upcoming", "finished"];
      if (!validStatuses.includes(statusParam)) {
        return NextResponse.json(
          {
            success: false,
            error: `الحالة مش صح - لازم تكون: ${validStatuses.join("، ")}`,
          },
          { status: 400 }
        );
      }
      matches = matches.filter((m) => m.status === statusParam);
    }

    // Sort: live first, then upcoming, then finished
    const statusOrder = { live: 0, upcoming: 1, finished: 2 };
    matches.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    // Calculate summary stats
    const stats = {
      total: matches.length,
      live: matches.filter((m) => m.status === "live").length,
      upcoming: matches.filter((m) => m.status === "upcoming").length,
      finished: matches.filter((m) => m.status === "finished").length,
    };

    return NextResponse.json({
      success: true,
      data: matches,
      stats,
      count: matches.length,
      filter: statusParam || "all",
    });
  } catch (error) {
    console.error("Matches API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حصلت مشكلة في جلب بيانات الماتشات",
        data: MOCK_MATCHES,
        count: MOCK_MATCHES.length,
      },
      { status: 500 }
    );
  }
}
