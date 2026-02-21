import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.LATE_API_KEY;
  const baseUrl = process.env.LATE_API_BASE_URL || "https://getlate.dev/api/v1";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Check for profileId query param to list accounts
  const profileId = request.nextUrl.searchParams.get("profileId");
  
  // Check if API key exists
  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "LATE_API_KEY is not set",
      baseUrl,
      supabaseServiceRoleSet: !!serviceRoleKey,
    });
  }
  
  const results: Record<string, unknown> = {
    baseUrl,
    apiKeySet: true,
    apiKeyPrefix: apiKey.substring(0, 8) + "...",
    supabaseServiceRoleSet: !!serviceRoleKey,
  };
  
  // Test 1: List profiles (GET)
  try {
    const listRes = await fetch(`${baseUrl}/profiles`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    
    const listData = await listRes.json().catch(() => null);
    results.listProfiles = {
      status: listRes.status,
      ok: listRes.ok,
      data: listData,
    };
    
    // If profileId provided, or use first profile, list accounts
    const targetProfileId = profileId || listData?.profiles?.[0]?._id;
    if (targetProfileId) {
      const accountsRes = await fetch(`${baseUrl}/accounts?profileId=${targetProfileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      const accountsData = await accountsRes.json().catch(() => null);
      results.listAccounts = {
        profileId: targetProfileId,
        status: accountsRes.status,
        ok: accountsRes.ok,
        data: accountsData,
      };
    }
  } catch (error) {
    results.listProfiles = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
  
  return NextResponse.json(results);
}
