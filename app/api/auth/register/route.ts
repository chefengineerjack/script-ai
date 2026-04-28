import { getUserByEmail, createUser } from "@/app/lib/user";
import { hashPassword, signToken, setAuthCookie } from "@/app/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json(
      { error: "メールアドレスとパスワードを入力してください" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { error: "有効なメールアドレスを入力してください" },
      { status: 400 }
    );
  }
  if ((password as string).length < 8) {
    return Response.json(
      { error: "パスワードは8文字以上で入力してください" },
      { status: 400 }
    );
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return Response.json(
      { error: "このメールアドレスは既に登録されています" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(email, passwordHash);
  const token = await signToken({ email: user.email, plan: user.plan });
  await setAuthCookie(token);

  return Response.json({ email: user.email, plan: user.plan });
}
