import type Stripe from "stripe";
import { stripe } from "@/app/lib/stripe";
import { updateUserPlan, getUserByStripeCustomerId } from "@/app/lib/user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = (
          session.metadata?.email ??
          session.customer_email ??
          ""
        ).toLowerCase();
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (email) {
          await updateUserPlan(email, "standard", customerId, subscriptionId);
          console.log(`Plan upgraded to standard: ${email}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const user = await getUserByStripeCustomerId(customerId);

        if (user) {
          await updateUserPlan(user.email, "free");
          console.log(`Plan downgraded to free: ${user.email}`);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return Response.json({ error: "Handler error" }, { status: 500 });
  }

  return Response.json({ received: true });
}
