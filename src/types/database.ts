// ─── Database Types ─────────────────────────────────────────────────────────
// These types mirror the Supabase schema and are the shared contract
// that every feature module codes against.

export type SubscriptionPlan = "solo" | "starter" | "advanced";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";
export type Platform = "facebook" | "instagram" | "tiktok" | "youtube" | "linkedin" | "google_business";
export type AccountStatus = "active" | "disconnected" | "expired";
export type PostStatus = "draft" | "scheduled" | "published" | "failed";
export type MessageType = "comment" | "dm" | "review";

export const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
  solo: 1,
  starter: 5,
  advanced: 10,
};

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; label: string }> = {
  solo: { monthly: 5, label: "Solo" },
  starter: { monthly: 10, label: "Starter" },
  advanced: { monthly: 20, label: "Advanced" },
};

export const PLATFORMS: { id: Platform; label: string; color: string; icon: string }[] = [
  { id: "facebook", label: "Facebook", color: "#1877F2", icon: "Facebook" },
  { id: "instagram", label: "Instagram", color: "#E4405F", icon: "Instagram" },
  { id: "tiktok", label: "TikTok", color: "#000000", icon: "Music" },
  { id: "youtube", label: "YouTube", color: "#FF0000", icon: "Youtube" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2", icon: "Linkedin" },
  { id: "google_business", label: "Google Business", color: "#4285F4", icon: "MapPin" },
];

// ─── Row types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  brand_limit: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  late_profile_id: string | null;
  color: string;
  created_at: string;
}

export interface ConnectedAccount {
  id: string;
  brand_id: string;
  platform: Platform;
  late_account_id: string;
  platform_username: string | null;
  platform_avatar: string | null;
  connected_at: string;
  status: AccountStatus;
}

export interface Post {
  id: string;
  brand_id: string;
  user_id: string;
  content: Record<string, string>; // platform -> content
  media_urls: string[];
  platforms: Platform[];
  status: PostStatus;
  scheduled_for: string | null;
  published_at: string | null;
  late_post_id: string | null;
  platform_post_urls: Record<string, string> | null;
  location: { name: string; lat?: number; lng?: number } | null;
  created_at: string;
}

export interface AnalyticsCache {
  id: string;
  connected_account_id: string;
  date: string;
  followers: number;
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  raw_data: Record<string, unknown>;
  synced_at: string;
}

export interface InboxMessage {
  id: string;
  brand_id: string;
  connected_account_id: string;
  type: MessageType;
  platform: Platform;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  is_read: boolean;
  is_resolved: boolean;
  late_message_id: string;
  thread_id: string | null;
  received_at: string;
  replied_at: string | null;
}

// ─── API response helpers ───────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}
