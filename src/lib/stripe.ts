import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

export const STRIPE_PRICE_IDS: Record<string, string> = {
  solo: process.env.STRIPE_PRICE_SOLO || "",
  starter: process.env.STRIPE_PRICE_STARTER || "",
  advanced: process.env.STRIPE_PRICE_ADVANCED || "",
};
