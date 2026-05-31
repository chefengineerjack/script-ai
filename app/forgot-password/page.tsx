"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
      } else {
        setSent(true);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F4EE] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-xl font-black text-[#0F1B2D]">営業スクリプトAI</span>
          </Link>
        </div>

        <div className="bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_8px_32px_rgba(15,27,45,0.12)] overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-[#0F1B2D] px-6 py-5">
            <h1 className="text-base font-black text-[#C8FF3E]">パスワード再設定</h1>
            <p className="mt-1 text-xs text-white/60">
              登録済みのメールアドレスに再設定リンクをお送りします
            </p>
          </div>

          <div className="px-6 py-6">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#C8FF3E]/20 border-2 border-[#C8FF3E] flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-[#0F1B2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-[#0F1B2D] text-sm">メールを送信しました</p>
                  <p className="mt-2 text-xs text-[#4A5A6E] leading-relaxed">
                    入力されたアドレスにアカウントが存在する場合、<br />
                    パスワード再設定のリンクをお送りしました。<br />
                    メールボックスをご確認ください。
                  </p>
                  <p className="mt-2 text-xs text-[#4A5A6E]">リンクの有効期限は<strong>1時間</strong>です。</p>
                </div>
                <Link
                  href="/"
                  className="inline-block mt-2 text-xs font-bold text-[#0F1B2D] underline underline-offset-2"
                >
                  トップページに戻る
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#4A5A6E]">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-[12px] border-[1.5px] border-[#E5E1D7] bg-[#F6F4EE] px-3.5 py-2.5 text-sm text-[#0F1B2D] placeholder:text-[#4A5A6E]/40 focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition"
                  />
                </div>

                {error && (
                  <p className="rounded-[12px] bg-[#D9534F]/10 border border-[#D9534F]/30 px-4 py-3 text-sm text-[#D9534F]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[14px] bg-[#0F1B2D] py-3 text-sm font-black text-[#C8FF3E] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                >
                  {loading ? "送信中..." : "再設定メールを送信"}
                </button>

                <p className="text-center text-xs text-[#4A5A6E]">
                  <Link href="/" className="font-bold text-[#0F1B2D] underline underline-offset-2">
                    ログインに戻る
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
