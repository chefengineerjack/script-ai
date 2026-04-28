import { getUserFromRequest, signToken, setAuthCookie } from "@/app/lib/auth";
import { getUserByEmail } from "@/app/lib/user";

export async function GET(request: Request) {
  const jwtUser = await getUserFromRequest(request);
  if (!jwtUser) return Response.json({ user: null });

  // Redisから最新プランを取得（Stripeによるアップグレード/ダウングレードを反映）
  const dbUser = await getUserByEmail(jwtUser.email);
  if (!dbUser) return Response.json({ user: null });

  // プランが変わっていたらJWTクッキーを再発行
  if (dbUser.plan !== jwtUser.plan) {
    const token = await signToken({ email: dbUser.email, plan: dbUser.plan });
    await setAuthCookie(token);
  }

  return Response.json({ user: { email: dbUser.email, plan: dbUser.plan } });
}
