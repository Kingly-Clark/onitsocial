import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "./(dashboard-client)/layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (userError || !userData) {
    redirect("/auth/login");
  }

  // Fetch brands for this user
  const { data: brandsData } = await supabase
    .from("brands")
    .select("*")
    .eq("user_id", session.user.id);

  // Fetch connected accounts
  const { data: accountsData } = await supabase
    .from("connected_accounts")
    .select("*");

  return (
    <DashboardLayoutClient
      user={userData}
      brands={brandsData || []}
      accounts={accountsData || []}
    >
      {children}
    </DashboardLayoutClient>
  );
}
