import { getUserByEmail } from "@/app/lib/user";
import { verifyPassword, signToken, setAuthCookie } from "@/app/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json(
      { error: "メールアドレスとパスワードを入力してください" },
      { status: 400 }
    );
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return Response.json(
      { error: "メールアドレスまたはパスワードが正しくありません" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return Response.json(
      { error: "メールアドレスまたはパスワードが正しくありません" },
      { status: 401 }
    );
  }

  const token = await signToken({ email: user.email, plan: user.plan });
  await setAuthCookie(token);

  return Response.json({ email: user.email, plan: user.plan });
}
