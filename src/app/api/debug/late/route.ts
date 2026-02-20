import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.LATE_API_KEY;
  const baseUrl = process.env.LATE_API_BASE_URL || "https://getlate.dev/api/v1";
  
  // Check if API key exists
  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "LATE_API_KEY is not set",
      baseUrl,
    });
  }
  
  // Test the API by listing profiles
  try {
    const res = await fetch(`${baseUrl}/profiles`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    
    const data = await res.json().catch(() => null);
    
    if (res.ok) {
      return NextResponse.json({
        status: "success",
        message: "API connection successful",
        baseUrl,
        apiKeySet: true,
        apiKeyPrefix: apiKey.substring(0, 8) + "...",
        profileCount: Array.isArray(data?.data) ? data.data.length : "unknown",
      });
    } else {
      return NextResponse.json({
        status: "error",
        message: `API returned ${res.status}: ${res.statusText}`,
        baseUrl,
        apiKeySet: true,
        apiKeyPrefix: apiKey.substring(0, 8) + "...",
        response: data,
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      baseUrl,
      apiKeySet: true,
      apiKeyPrefix: apiKey.substring(0, 8) + "...",
    });
  }
}
