import { verifyResetToken, deleteResetToken } from "@/app/lib/resetToken";
import { updateUserPassword } from "@/app/lib/user";
import { hashPassword } from "@/app/lib/auth";

export async function POST(request: Request) {
  const { token, newPassword } = await request.json();

  if (!token || !newPassword) {
    return Response.json({ error: "無効なリクエストです" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return Response.json(
      { error: "パスワードは8文字以上で設定してください" },
      { status: 400 }
    );
  }

  const email = await verifyResetToken(token);
  if (!email) {
    return Response.json(
      { error: "リンクが無効または期限切れです。もう一度パスワード再設定をお試しください。" },
      { status: 400 }
    );
  }

  const hash = await hashPassword(newPassword);
  const ok = await updateUserPassword(email, hash);
  if (!ok) {
    return Response.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  await deleteResetToken(token);

  return Response.json({ ok: true });
}
