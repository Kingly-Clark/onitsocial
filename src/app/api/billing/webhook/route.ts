import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";

// Map Stripe price IDs to plan names
async function getPriceIdToPlanMap(): Promise<Record<string, SubscriptionPlan>> {
  const priceIds = {
    solo: process.env.STRIPE_PRICE_SOLO || "",
    starter: process.env.STRIPE_PRICE_STARTER || "",
    advanced: process.env.STRIPE_PRICE_ADVANCED || "",
  };

  return {
    [priceIds.solo]: "solo",
    [priceIds.starter]: "starter",
    [priceIds.advanced]: "advanced",
  };
}

// Get plan from price ID
async function getPlanFromPriceId(priceId: string): Promise<SubscriptionPlan | null> {
  const map = await getPriceIdToPlanMap();
  return map[priceId] || null;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = getStripe().webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.warn("checkout.session.completed missing metadata");
          break;
        }

        // Get the subscription details
        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string
        );

        const priceId = subscription.items.data[0]?.price.id;
        const planFromPrice = await getPlanFromPriceId(priceId);

        const updatePlan = planFromPrice || (plan as SubscriptionPlan);
        const brandLimit = ["solo", "starter", "advanced"].includes(updatePlan)
          ? { solo: 1, starter: 5, advanced: 10 }[updatePlan]
          : 1;

        await supabase
          .from("users")
          .update({
            subscription_plan: updatePlan,
            subscription_status: "active",
            brand_limit: brandLimit,
          })
          .eq("id", userId);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        // Get user by stripe_customer_id
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userError || !user) {
          console.warn("User not found for stripe customer:", customerId);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = await getPlanFromPriceId(priceId);

        if (!plan) {
          console.warn("Plan not found for price ID:", priceId);
          break;
        }

        const brandLimit = { solo: 1, starter: 5, advanced: 10 }[plan];

        // Determine status based on subscription state
        let status: SubscriptionStatus = "active";
        if (subscription.status === "past_due") {
          status = "past_due";
        } else if (subscription.status === "trialing") {
          status = "trialing";
        }

        await supabase
          .from("users")
          .update({
            subscription_plan: plan,
            subscription_status: status,
            brand_limit: brandLimit,
          })
          .eq("id", user.id);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        // Get user by stripe_customer_id
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userError || !user) {
          console.warn("User not found for stripe customer:", customerId);
          break;
        }

        // Reset to solo plan
        await supabase
          .from("users")
          .update({
            subscription_status: "canceled",
            subscription_plan: "solo",
            brand_limit: 1,
          })
          .eq("id", user.id);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;

        // Get user by stripe_customer_id
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userError || !user) {
          console.warn("User not found for stripe customer:", customerId);
          break;
        }

        // Update status to past_due
        await supabase
          .from("users")
          .update({
            subscription_status: "past_due",
          })
          .eq("id", user.id);

        break;
      }

      default:
        // Unhandled event type - still return 200
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 to avoid Stripe retrying
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
