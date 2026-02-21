import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const LATE_API_BASE = process.env.LATE_API_BASE_URL || "https://getlate.dev/api/v1";

// Map platform to getLate endpoint paths
const PLATFORM_ENDPOINTS: Record<string, { list: string; select: string; itemKey: string }> = {
  facebook: {
    list: "/connect/facebook/select-page",
    select: "/connect/facebook/select-page",
    itemKey: "pages",
  },
  linkedin: {
    list: "/connect/linkedin/organizations",
    select: "/connect/linkedin/select-organization",
    itemKey: "organizations",
  },
  googlebusiness: {
    list: "/connect/googlebusiness/locations",
    select: "/connect/googlebusiness/select-location",
    itemKey: "locations",
  },
  pinterest: {
    list: "/connect/pinterest/select-board",
    select: "/connect/pinterest/select-board",
    itemKey: "boards",
  },
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");
    const tempToken = searchParams.get("tempToken");
    const connectToken = searchParams.get("connectToken");
    const platform = searchParams.get("platform")?.toLowerCase();

    if (!profileId || !tempToken || !connectToken || !platform) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const endpoints = PLATFORM_ENDPOINTS[platform];
    if (!endpoints) {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
    }

    // Fetch items from getLate API
    const params = new URLSearchParams({ profileId, tempToken });
    const response = await fetch(`${LATE_API_BASE}${endpoints.list}?${params}`, {
      headers: { "X-Connect-Token": connectToken },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || `Failed to fetch ${platform} items` },
        { status: response.status }
      );
    }

    // Normalize response - getLate might use different keys
    const items = data[endpoints.itemKey] || data.pages || data.organizations || data.locations || data.boards || [];
    
    return NextResponse.json({ [endpoints.itemKey]: items });
  } catch (error) {
    console.error("GET /api/connections/select-items error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, itemId, tempToken, userProfile, connectToken, platform } = body;

    if (!profileId || !itemId || !connectToken || !platform) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const platformLower = platform.toLowerCase();
    const endpoints = PLATFORM_ENDPOINTS[platformLower];
    if (!endpoints) {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
    }

    // Build the request body based on platform
    const requestBody: Record<string, unknown> = {
      profileId,
      tempToken,
      userProfile,
    };

    // Different platforms use different ID field names
    if (platformLower === "facebook") {
      requestBody.pageId = itemId;
    } else if (platformLower === "linkedin") {
      requestBody.organizationId = itemId;
    } else if (platformLower === "googlebusiness") {
      requestBody.locationId = itemId;
    } else if (platformLower === "pinterest") {
      requestBody.boardId = itemId;
    }

    // Select item via getLate API
    const response = await fetch(`${LATE_API_BASE}${endpoints.select}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Connect-Token": connectToken,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || `Failed to select ${platform} item` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/connections/select-items error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
