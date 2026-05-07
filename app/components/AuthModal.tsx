"use client";

import { useState } from "react";

type Tab = "login" | "register";

type Props = {
  defaultTab?: Tab;
  onSuccess: (email: string, plan: string) => void;
  onClose: () => void;
};

export default function AuthModal({ defaultTab = "login", onSuccess, onClose }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
      } else {
        onSuccess(data.email, data.plan);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B2D]/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#F6F4EE] rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_24px_64px_rgba(15,27,45,0.2)] overflow-hidden">
        {/* ヘッダー */}
        <div className="border-b border-[#E5E1D7] px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-black text-[#0F1B2D]">
            {tab === "login" ? "ログイン" : "新規登録（無料）"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-[10px] p-1.5 text-[#4A5A6E] hover:bg-[#E5E1D7] hover:text-[#0F1B2D] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-[#E5E1D7]">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-[#0F1B2D] text-[#0F1B2D] bg-white"
                  : "text-[#4A5A6E] hover:text-[#0F1B2D]"
              }`}
            >
              {t === "login" ? "ログイン" : "新規登録"}
            </button>
          ))}
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 bg-white">
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

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#4A5A6E]">
              パスワード
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === "register" ? "8文字以上" : "パスワード"}
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
            {loading
              ? "処理中..."
              : tab === "login"
              ? "ログイン"
              : "登録する（無料）"}
          </button>

          {tab === "register" && (
            <p className="text-center text-xs text-[#4A5A6E]">
              登録後すぐに1日2回まで使えます
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
