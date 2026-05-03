"use client";

import { useState, useEffect, useRef } from "react";
import AuthModal from "@/app/components/AuthModal";

type UserInfo = { email: string; plan: string } | null;

const guides = [
  { label: "SPIN話法", href: "/guides/spin-selling-guide.html" },
  { label: "BANT", href: "/guides/bant-guide.html" },
  { label: "チャレンジャーセールス", href: "/guides/challenger-sales-guide.html" },
  { label: "MEDDIC", href: "/guides/meddic-guide.html" },
  { label: "PASONAの法則", href: "/guides/pasona-guide.html" },
];

export default function Navbar() {
  const [user, setUser] = useState<UserInfo>(null);
  const [authModal, setAuthModal] = useState<{ tab: "login" | "register" } | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (guideRef.current && !guideRef.current.contains(e.target as Node)) {
        setGuideOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.reload();
  }

  function handleAuthSuccess(email: string, plan: string) {
    setUser({ email, plan });
    setAuthModal(null);
    window.location.reload();
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">営業スクリプトAI</span>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#form"
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors px-2 py-1"
            >
              スクリプト生成
            </a>

            {/* 生成履歴（ログイン時のみ） */}
            {user && (
              <a
                href="/history"
                className="hidden sm:block text-sm text-gray-500 hover:text-indigo-600 transition-colors px-2 py-1"
              >
                生成履歴
              </a>
            )}

            {/* 営業フレームワーク解説 ドロップダウン */}
            <div
              ref={guideRef}
              className="relative hidden sm:block"
              onMouseEnter={() => setGuideOpen(true)}
              onMouseLeave={() => setGuideOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors px-2 py-1">
                営業フレームワーク解説
                <svg
                  className={`w-3 h-3 transition-transform duration-150 ${guideOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {guideOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-lg py-1 w-52">
                    {guides.map((g) => (
                      <a
                        key={g.href}
                        href={g.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        {g.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a
              href="#pricing"
              className="hidden sm:block rounded-lg bg-indigo-50 px-3.5 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              料金プラン
            </a>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      user.plan === "standard"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {user.plan === "standard" ? "スタンダード" : "フリー"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthModal({ tab: "login" })}
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors px-2 py-1"
                >
                  ログイン
                </button>
                <button
                  onClick={() => setAuthModal({ tab: "register" })}
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  新規登録
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {authModal && (
        <AuthModal
          defaultTab={authModal.tab}
          onSuccess={handleAuthSuccess}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
}
