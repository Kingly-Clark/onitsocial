import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.LATE_API_KEY;
  const baseUrl = process.env.LATE_API_BASE_URL || "https://getlate.dev/api/v1";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
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
  } catch (error) {
    results.listProfiles = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
  
  // Test 2: Create profile (POST) - to test write permission
  try {
    const createRes = await fetch(`${baseUrl}/profiles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Test Profile Debug" }),
    });
    
    const createData = await createRes.json().catch(() => null);
    results.createProfile = {
      status: createRes.status,
      ok: createRes.ok,
      data: createData,
    };
    
    // If created successfully, delete it
    if (createRes.ok && createData?.id) {
      const deleteRes = await fetch(`${baseUrl}/profiles/${createData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      results.deleteProfile = {
        status: deleteRes.status,
        ok: deleteRes.ok,
      };
    }
  } catch (error) {
    results.createProfile = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
  
  return NextResponse.json(results);
}
