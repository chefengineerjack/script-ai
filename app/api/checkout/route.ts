import { getUserFromRequest } from "@/app/lib/auth";
import { getUserByEmail } from "@/app/lib/user";
import { stripe } from "@/app/lib/stripe";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json(
      { error: "ログインが必要です" },
      { status: 401 }
    );
  }

  // Redisから最新プランを確認
  const dbUser = await getUserByEmail(user.email);
  if (dbUser?.plan === "standard") {
    return Response.json(
      { error: "すでにスタンダードプランです" },
      { status: 400 }
    );
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    "https://script-ai-opal.vercel.app";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer_email: user.email,
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#pricing`,
    metadata: { email: user.email },
  });

  return Response.json({ url: session.url });
}
