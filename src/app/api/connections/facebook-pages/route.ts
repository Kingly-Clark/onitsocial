import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const LATE_API_BASE = process.env.LATE_API_BASE_URL || "https://getlate.dev/api/v1";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");
    const tempToken = searchParams.get("tempToken");
    const connectToken = searchParams.get("connectToken");

    if (!profileId || !tempToken || !connectToken) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch pages from getLate API
    const params = new URLSearchParams({
      profileId,
      tempToken,
    });

    const response = await fetch(
      `${LATE_API_BASE}/connect/facebook/select-page?${params}`,
      {
        headers: {
          "X-Connect-Token": connectToken,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch pages" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/connections/facebook-pages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profileId, pageId, tempToken, userProfile, connectToken } = body;

    if (!profileId || !pageId || !connectToken) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Select page via getLate API
    const response = await fetch(
      `${LATE_API_BASE}/connect/facebook/select-page`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Connect-Token": connectToken,
        },
        body: JSON.stringify({
          profileId,
          pageId,
          tempToken,
          userProfile,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to select page" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/connections/facebook-pages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
