import { Resend } from "resend";
import { getUserByEmail } from "@/app/lib/user";
import { createResetToken } from "@/app/lib/resetToken";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email?.trim()) {
    return Response.json(
      { error: "メールアドレスを入力してください" },
      { status: 400 }
    );
  }

  const normalized = email.trim().toLowerCase();

  // ユーザーが存在しない場合でも成功レスポンスを返す（列挙攻撃対策）
  const user = await getUserByEmail(normalized);
  if (!user) {
    return Response.json({ ok: true });
  }

  const token = await createResetToken(normalized);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  const from =
    process.env.RESEND_FROM_EMAIL ?? "noreply@resend.dev";

  await resend.emails.send({
    from,
    to: normalized,
    subject: "パスワード再設定のご案内 | 営業スクリプトAI",
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#F6F4EE;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4EE;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:2px solid #0F1B2D;overflow:hidden;">
          <tr>
            <td style="background:#0F1B2D;padding:24px 32px;">
              <p style="margin:0;color:#C8FF3E;font-size:18px;font-weight:900;letter-spacing:-0.5px;">営業スクリプトAI</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#0F1B2D;">パスワード再設定</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#4A5A6E;line-height:1.7;">
                パスワード再設定のリクエストを受け付けました。<br />
                以下のボタンをクリックして新しいパスワードを設定してください。
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#0F1B2D;border-radius:12px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#C8FF3E;font-size:14px;font-weight:700;text-decoration:none;">
                      パスワードを再設定する
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:#4A5A6E;">
                ボタンが機能しない場合は以下のURLをブラウザに貼り付けてください：
              </p>
              <p style="margin:0 0 24px;font-size:11px;color:#4A5A6E;word-break:break-all;">
                ${resetUrl}
              </p>
              <hr style="border:none;border-top:1px solid #E5E1D7;margin:0 0 24px;" />
              <p style="margin:0;font-size:12px;color:#4A5A6E;line-height:1.7;">
                このリンクは<strong>1時間</strong>で無効になります。<br />
                パスワード再設定をリクエストしていない場合は、このメールを無視してください。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });

  return Response.json({ ok: true });
}
