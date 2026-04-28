import { getUserFromRequest } from "@/app/lib/auth";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ user: null });
  return Response.json({ user: { email: user.email, plan: user.plan } });
}
