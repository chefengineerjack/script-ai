import Stripe from "stripe";

// STRIPE_SECRET_KEY が未設定の場合もビルドエラーにならないようにフォールバック
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});
