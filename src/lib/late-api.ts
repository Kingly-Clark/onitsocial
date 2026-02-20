// ─── getlate.dev API Client ─────────────────────────────────────────────────
// Server-side only — never import this in client components.
// All social media operations go through this client.

const BASE_URL = process.env.LATE_API_BASE_URL || "https://getlate.dev/api/v1";
const API_KEY = process.env.LATE_API_KEY || "";

interface LateRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  params?: Record<string, string>;
}

class LateApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public responseBody?: unknown
  ) {
    super(message);
    this.name = "LateApiError";
  }
}

async function lateRequest<T = unknown>(
  endpoint: string,
  options: LateRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new LateApiError(
      res.status,
      `Late API error: ${res.status} ${res.statusText}`,
      errorBody
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Profiles (Social Sets = Brands) ────────────────────────────────────────

export async function createProfile(name: string) {
  const response = await lateRequest<{ 
    message: string; 
    profile: { _id: string; name: string } 
  }>("/profiles", {
    method: "POST",
    body: { name },
  });
  return { id: response.profile._id, name: response.profile.name };
}

export async function deleteProfile(profileId: string) {
  return lateRequest(`/profiles/${profileId}`, { method: "DELETE" });
}

// ─── Connections (OAuth) ────────────────────────────────────────────────────

export async function getConnectUrl(platform: string, profileId: string, redirectUrl: string) {
  const response = await lateRequest<{ url?: string; connectUrl?: string; authUrl?: string }>(`/connect/${platform}`, {
    params: { 
      profileId, 
      redirect_url: redirectUrl,
      headless: "true"  // This makes getLate redirect back to our app instead of showing their dashboard
    },
  });
  // Handle different possible response formats
  const url = response.url || response.connectUrl || response.authUrl;
  if (!url) {
    console.error("Unexpected getLate connect response:", response);
    throw new Error("No connect URL in response");
  }
  return { url };
}

// ─── Accounts ───────────────────────────────────────────────────────────────

export async function listAccounts(profileId: string) {
  return lateRequest<{ data: Array<{ id: string; platform: string; username: string; avatarUrl: string }> }>(
    "/accounts",
    { params: { profileId } }
  );
}

export async function deleteAccount(accountId: string) {
  return lateRequest(`/accounts/${accountId}`, { method: "DELETE" });
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function createPost(payload: {
  profileId: string;
  text: string;
  mediaUrls?: string[];
  platforms: string[];
  publishNow?: boolean;
  scheduledDate?: string;
}) {
  return lateRequest<{ id: string; platformPostUrl?: string }>("/posts", {
    method: "POST",
    body: payload,
  });
}

export async function getPost(postId: string) {
  return lateRequest<{ id: string; status: string; platformPostUrl?: string }>(
    `/posts/${postId}`
  );
}

export async function deletePost(postId: string) {
  return lateRequest(`/posts/${postId}`, { method: "DELETE" });
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export async function getAccountAnalytics(
  accountId: string,
  startDate: string,
  endDate: string
) {
  return lateRequest<{
    followers: number;
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
    daily: Array<{
      date: string;
      followers: number;
      impressions: number;
      reach: number;
      engagement: number;
      clicks: number;
    }>;
  }>(`/analytics/${accountId}`, {
    params: { startDate, endDate },
  });
}

// ─── Messages & Comments ────────────────────────────────────────────────────

export async function getMessages(profileId: string, cursor?: string) {
  const params: Record<string, string> = { profileId };
  if (cursor) params.cursor = cursor;
  return lateRequest<{
    data: Array<{
      id: string;
      type: "dm" | "comment" | "review";
      platform: string;
      senderName: string;
      senderAvatar: string;
      content: string;
      threadId: string;
      createdAt: string;
      accountId: string;
    }>;
    nextCursor?: string;
  }>("/messages", { params });
}

export async function replyToMessage(messageId: string, text: string) {
  return lateRequest(`/messages/${messageId}/reply`, {
    method: "POST",
    body: { text },
  });
}

// ─── Media Upload ───────────────────────────────────────────────────────────

export async function uploadMedia(file: Buffer, filename: string, mimeType: string) {
  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(file)], { type: mimeType }), filename);

  const res = await fetch(`${BASE_URL}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: formData,
  });

  if (!res.ok) throw new LateApiError(res.status, "Media upload failed");
  return res.json() as Promise<{ url: string }>;
}

export { LateApiError };
