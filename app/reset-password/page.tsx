"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError("無効なリンクです。パスワード再設定をやり直してください。");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return;
    }
    if (newPassword !== confirm) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
      } else {
        setDone(true);
        setTimeout(() => router.push("/"), 3000);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_8px_32px_rgba(15,27,45,0.12)] overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-[#0F1B2D] px-6 py-5">
        <h1 className="text-base font-black text-[#C8FF3E]">新しいパスワードを設定</h1>
        <p className="mt-1 text-xs text-white/60">
          新しいパスワードを入力してください
        </p>
      </div>

      <div className="px-6 py-6">
        {done ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#C8FF3E]/20 border-2 border-[#C8FF3E] flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-[#0F1B2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#0F1B2D] text-sm">パスワードを変更しました</p>
              <p className="mt-2 text-xs text-[#4A5A6E] leading-relaxed">
                新しいパスワードでログインできます。<br />
                3秒後にトップページへ移動します。
              </p>
            </div>
            <Link
              href="/"
              className="inline-block mt-2 text-xs font-bold text-[#0F1B2D] underline underline-offset-2"
            >
              今すぐトップページへ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#4A5A6E]">
                新しいパスワード
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8文字以上"
                disabled={!token}
                className="w-full rounded-[12px] border-[1.5px] border-[#E5E1D7] bg-[#F6F4EE] px-3.5 py-2.5 text-sm text-[#0F1B2D] placeholder:text-[#4A5A6E]/40 focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#4A5A6E]">
                パスワード（確認）
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="もう一度入力"
                disabled={!token}
                className="w-full rounded-[12px] border-[1.5px] border-[#E5E1D7] bg-[#F6F4EE] px-3.5 py-2.5 text-sm text-[#0F1B2D] placeholder:text-[#4A5A6E]/40 focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="rounded-[12px] bg-[#D9534F]/10 border border-[#D9534F]/30 px-4 py-3 text-sm text-[#D9534F]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-[14px] bg-[#0F1B2D] py-3 text-sm font-black text-[#C8FF3E] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? "変更中..." : "パスワードを変更する"}
            </button>

            {!token && (
              <p className="text-center text-xs text-[#4A5A6E]">
                <Link href="/forgot-password" className="font-bold text-[#0F1B2D] underline underline-offset-2">
                  パスワード再設定をやり直す
                </Link>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F6F4EE] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-xl font-black text-[#0F1B2D]">営業スクリプトAI</span>
          </Link>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-[#4A5A6E]">読み込み中...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
