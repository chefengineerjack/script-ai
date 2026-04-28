"use client";

import { useState } from "react";
import AuthModal from "@/app/components/AuthModal";

type Props = {
  className?: string;
  label?: string;
};

export default function CheckoutButton({
  className,
  label = "月額980円で始める",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (res.status === 401) {
        // 未ログイン → 先にアカウント登録/ログイン
        setShowAuth(true);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function handleAuthSuccess() {
    setShowAuth(false);
    // ログイン後に自動で決済フローを再開
    startCheckout();
  }

  return (
    <>
      <div>
        <button
          onClick={startCheckout}
          disabled={loading}
          className={className}
        >
          {loading ? "処理中..." : label}
        </button>
        {error && (
          <p className="mt-1.5 text-center text-xs text-red-500">{error}</p>
        )}
      </div>

      {showAuth && (
        <AuthModal
          defaultTab="register"
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
