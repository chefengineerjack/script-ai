"use client";

import { useState, useEffect } from "react";
import AuthModal from "@/app/components/AuthModal";

type UserInfo = { email: string; plan: string } | null;

export default function Navbar() {
  const [user, setUser] = useState<UserInfo>(null);
  const [authModal, setAuthModal] = useState<{ tab: "login" | "register" } | null>(null);

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
            <a
              href="#pricing"
              className="hidden sm:block rounded-lg bg-indigo-50 px-3.5 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              料金プラン
            </a>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-xs text-gray-400 max-w-[130px] truncate">
                  {user.email}
                </span>
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
