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
      <nav className="sticky top-0 z-40 bg-[#F6F4EE] border-b border-[#E5E1D7]">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <span className="text-base font-black text-[#0F1B2D] tracking-tight">
            営業スクリプトAI
          </span>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#form"
              className="text-sm font-medium text-[#4A5A6E] hover:text-[#0F1B2D] transition-colors px-2 py-1"
            >
              スクリプト生成
            </a>

            {/* 生成履歴（ログイン時のみ） */}
            {user && (
              <a
                href="/history"
                className="hidden sm:block text-sm font-medium text-[#4A5A6E] hover:text-[#0F1B2D] transition-colors px-2 py-1"
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
              <button className="flex items-center gap-1 text-sm font-medium text-[#4A5A6E] hover:text-[#0F1B2D] transition-colors px-2 py-1">
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
                  <div className="bg-[#F6F4EE] rounded-[14px] border border-[#E5E1D7] shadow-[0_8px_32px_rgba(15,27,45,0.12)] py-1 w-52">
                    {guides.map((g) => (
                      <a
                        key={g.href}
                        href={g.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2.5 text-sm font-medium text-[#4A5A6E] hover:bg-[#0F1B2D] hover:text-[#C8FF3E] transition-colors"
                      >
                        {g.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 料金プラン */}
            <a
              href="#pricing"
              className="hidden sm:block rounded-[14px] border border-[#0F1B2D] px-3.5 py-1.5 text-sm font-medium text-[#0F1B2D] hover:bg-[#0F1B2D] hover:text-[#F6F4EE] transition-colors"
            >
              料金プラン
            </a>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-xs text-[#4A5A6E] max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      user.plan === "standard"
                        ? "bg-[#C8FF3E] text-[#0F1B2D]"
                        : "bg-[#E5E1D7] text-[#4A5A6E]"
                    }`}
                  >
                    {user.plan === "standard" ? "スタンダード" : "フリー"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-[14px] border border-[#E5E1D7] px-3 py-1.5 text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthModal({ tab: "login" })}
                  className="text-sm font-medium text-[#4A5A6E] hover:text-[#0F1B2D] transition-colors px-2 py-1"
                >
                  ログイン
                </button>
                <button
                  onClick={() => setAuthModal({ tab: "register" })}
                  className="rounded-[14px] bg-[#0F1B2D] px-4 py-1.5 text-sm font-semibold text-[#F6F4EE] hover:opacity-90 transition-opacity"
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
