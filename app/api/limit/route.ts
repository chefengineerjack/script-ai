import { getUserFromRequest } from "@/app/lib/auth";
import { getUserByEmail } from "@/app/lib/user";
import {
  getGuestRemaining,
  getFreeUserRemaining,
  getStandardUserRemaining,
  FREE_DAILY_LIMIT,
  GUEST_TOTAL_LIMIT,
  STANDARD_MONTHLY_LIMIT,
} from "@/app/lib/rateLimit";

export async function GET(request: Request) {
  // デモモード時は制限なしのスタンダードプランを返す
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return Response.json({
      remaining: null,
      limit: null,
      plan: "standard",
      email: null,
    });
  }

  const jwtUser = await getUserFromRequest(request);

  if (jwtUser) {
    // Redisから最新プランを取得
    const dbUser = await getUserByEmail(jwtUser.email);
    const plan = dbUser?.plan ?? jwtUser.plan;

    if (plan === "standard") {
      const remaining = await getStandardUserRemaining(jwtUser.email);
      return Response.json({
        remaining,
        limit: STANDARD_MONTHLY_LIMIT,
        plan: "standard",
        email: jwtUser.email,
      });
    }

    // フリープラン
    const remaining = await getFreeUserRemaining(jwtUser.email);
    return Response.json({
      remaining,
      limit: FREE_DAILY_LIMIT,
      plan: "free",
      email: jwtUser.email,
    });
  }

  // ゲスト（未ログイン）
  const guestToken = request.headers.get("x-guest-token") ?? "unknown";
  const remaining = await getGuestRemaining(guestToken);
  return Response.json({
    remaining,
    limit: GUEST_TOTAL_LIMIT,
    plan: "guest",
    email: null,
  });
}
