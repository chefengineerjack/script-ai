import { getUserFromRequest } from "@/app/lib/auth";
import {
  getGuestRemaining,
  getFreeUserRemaining,
  FREE_DAILY_LIMIT,
  GUEST_TOTAL_LIMIT,
} from "@/app/lib/rateLimit";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);

  // スタンダードプラン：無制限
  if (user?.plan === "standard") {
    return Response.json({
      remaining: null,
      limit: null,
      plan: "standard",
      email: user.email,
    });
  }

  // フリープラン
  if (user?.plan === "free") {
    const remaining = await getFreeUserRemaining(user.email);
    return Response.json({
      remaining,
      limit: FREE_DAILY_LIMIT,
      plan: "free",
      email: user.email,
    });
  }

  // ゲスト（未ログイン）
  const guestToken =
    request.headers.get("x-guest-token") ?? "unknown";
  const remaining = await getGuestRemaining(guestToken);
  return Response.json({
    remaining,
    limit: GUEST_TOTAL_LIMIT,
    plan: "guest",
    email: null,
  });
}
