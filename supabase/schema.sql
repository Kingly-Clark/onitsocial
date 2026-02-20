-- ══════════════════════════════════════════════════════════════════════════════
-- Onit Database Schema
-- Run this in the Supabase SQL editor to set up all tables and RLS policies.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── Custom types ───────────────────────────────────────────────────────────
CREATE TYPE subscription_plan AS ENUM ('solo', 'starter', 'advanced');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
CREATE TYPE platform_type AS ENUM ('facebook', 'instagram', 'tiktok', 'youtube', 'linkedin', 'google_business');
CREATE TYPE account_status AS ENUM ('active', 'disconnected', 'expired');
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
CREATE TYPE message_type AS ENUM ('comment', 'dm', 'review');

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  subscription_plan subscription_plan NOT NULL DEFAULT 'solo',
  subscription_status subscription_status NOT NULL DEFAULT 'active',
  brand_limit INTEGER NOT NULL DEFAULT 1,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Brands ─────────────────────────────────────────────────────────────────
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  late_profile_id TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brands_user_id ON public.brands(user_id);

-- ─── Connected Accounts ─────────────────────────────────────────────────────
CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  late_account_id TEXT NOT NULL,
  platform_username TEXT,
  platform_avatar TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status account_status NOT NULL DEFAULT 'active',
  UNIQUE(brand_id, platform)
);

CREATE INDEX idx_connected_accounts_brand_id ON public.connected_accounts(brand_id);

-- ─── Posts ───────────────────────────────────────────────────────────────────
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}',
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  status post_status NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  late_post_id TEXT,
  platform_post_urls JSONB,
  location JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_brand_id ON public.posts(brand_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_scheduled_for ON public.posts(scheduled_for) WHERE status = 'scheduled';

-- ─── Analytics Cache ────────────────────────────────────────────────────────
CREATE TABLE public.analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connected_account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  engagement INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  raw_data JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(connected_account_id, date)
);

CREATE INDEX idx_analytics_cache_account_date ON public.analytics_cache(connected_account_id, date);

-- ─── Inbox Messages ────────────────────────────────────────────────────────
CREATE TABLE public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  connected_account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  type message_type NOT NULL,
  platform platform_type NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  late_message_id TEXT NOT NULL,
  thread_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  replied_at TIMESTAMPTZ
);

CREATE INDEX idx_inbox_brand_id ON public.inbox_messages(brand_id);
CREATE INDEX idx_inbox_unread ON public.inbox_messages(brand_id) WHERE is_read = FALSE;
CREATE INDEX idx_inbox_unresolved ON public.inbox_messages(brand_id) WHERE is_resolved = FALSE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- Each user can only access their own data.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

-- Users: can only see/update own row
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Brands: scoped to user_id
CREATE POLICY "Users can view own brands" ON public.brands
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brands" ON public.brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brands" ON public.brands
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brands" ON public.brands
  FOR DELETE USING (auth.uid() = user_id);

-- Connected Accounts: scoped via brand ownership
CREATE POLICY "Users can view own connected accounts" ON public.connected_accounts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.brands WHERE brands.id = connected_accounts.brand_id AND brands.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own connected accounts" ON public.connected_accounts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.brands WHERE brands.id = connected_accounts.brand_id AND brands.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own connected accounts" ON public.connected_accounts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.brands WHERE brands.id = connected_accounts.brand_id AND brands.user_id = auth.uid())
  );

-- Posts: scoped to user_id
CREATE POLICY "Users can view own posts" ON public.posts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics: scoped via brand -> account chain
CREATE POLICY "Users can view own analytics" ON public.analytics_cache
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.connected_accounts ca
      JOIN public.brands b ON b.id = ca.brand_id
      WHERE ca.id = analytics_cache.connected_account_id AND b.user_id = auth.uid()
    )
  );

-- Inbox: scoped via brand ownership
CREATE POLICY "Users can view own inbox" ON public.inbox_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.brands WHERE brands.id = inbox_messages.brand_id AND brands.user_id = auth.uid())
  );
CREATE POLICY "Users can update own inbox" ON public.inbox_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.brands WHERE brands.id = inbox_messages.brand_id AND brands.user_id = auth.uid())
  );

-- ─── Function: Create user profile on signup ────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
