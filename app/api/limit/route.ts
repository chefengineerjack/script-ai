import { getClientIP, getRemainingCount, DAILY_LIMIT } from "@/app/lib/rateLimit";

export async function GET(request: Request) {
  const ip = getClientIP(request);
  const remaining = await getRemainingCount(ip);
  return Response.json({ remaining, limit: DAILY_LIMIT });
}
