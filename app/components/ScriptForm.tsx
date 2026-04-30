"use client";

import { useState, useEffect } from "react";
import ScriptResult from "@/app/components/ScriptResult";
import AuthModal from "@/app/components/AuthModal";
import LoadingTips from "@/app/components/LoadingTips";
import type { GenerateRequest, GenerateResult } from "@/app/types/generate";

const INDUSTRIES = [
  "IT・Web",
  "不動産",
  "人材",
  "金融・保険",
  "製造業",
  "医療・ヘルスケア",
  "教育",
  "飲食・小売",
  "その他",
];

const DEPARTMENTS = [
  "営業部",
  "マーケティング部",
  "経営企画部",
  "情報システム部・IT推進部",
  "人事部",
  "総務部",
  "経理・財務部",
  "購買・調達部",
  "開発・エンジニアリング部",
  "カスタマーサポート部",
  "法務部",
];

const POSITIONS = [
  "経営者・役員",
  "部長クラス",
  "課長・マネージャー",
  "担当者",
  "その他",
];

const PURPOSES = [
  { value: "appointment", label: "アポイント獲得" },
  { value: "hearing", label: "ヒアリング" },
  { value: "proposal", label: "サービス提案" },
  { value: "closing", label: "クロージング" },
];

const SCRIPT_TYPES = [
  { value: "call", label: "電話営業スクリプト" },
  { value: "email", label: "メール営業文面" },
  { value: "both", label: "両方" },
];

function IndustrySelect({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label} <span className="text-indigo-500">*</span>
      </label>
      <select
        name={name}
        required
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
      >
        <option value="">選択してください</option>
        {INDUSTRIES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

type LimitInfo = {
  remaining: number | null;
  limit: number | null;
  plan: "guest" | "free" | "standard";
};

function generateGuestToken(): string {
  return (
    "g_" +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36)
  );
}

export default function ScriptForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<{ tab: "login" | "register" } | null>(null);
  // Tips 表示制御：初回生成後から表示し、生成のたびに key を変えてリセット
  const [tipsVisible, setTipsVisible] = useState(false);
  const [generationKey, setGenerationKey] = useState(0);

  // ゲストトークン初期化 + 残り回数取得
  useEffect(() => {
    let token = localStorage.getItem("scriptai_guest_token");
    if (!token) {
      token = generateGuestToken();
      localStorage.setItem("scriptai_guest_token", token);
    }
    setGuestToken(token);

    fetch("/api/limit", { headers: { "x-guest-token": token } })
      .then((r) => r.json())
      .then((data) =>
        setLimitInfo({
          remaining: data.remaining,
          limit: data.limit,
          plan: data.plan,
        })
      )
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);
    // Tips を表示し、生成のたびに新しい Tips に切り替える
    setTipsVisible(true);
    setGenerationKey((k) => k + 1);

    const fd = new FormData(e.currentTarget);
    const targetCompany = (fd.get("targetCompany") as string).trim();
    const targetDepartment = (fd.get("targetDepartment") as string).trim();
    const payload: GenerateRequest = {
      ownIndustry: fd.get("ownIndustry") as string,
      targetIndustry: fd.get("targetIndustry") as string,
      ...(targetCompany && { targetCompany }),
      ...(targetDepartment && { targetDepartment }),
      product: fd.get("product") as string,
      webSearch: fd.get("webSearch") === "on",
      position: fd.get("position") as string,
      purpose: fd.get("purpose") as string,
      scriptType: fd.get("scriptType") as GenerateRequest["scriptType"],
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (guestToken) headers["x-guest-token"] = guestToken;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          setLimitInfo((prev) => (prev ? { ...prev, remaining: 0 } : null));
          if (data.plan === "guest") {
            setAuthModal({ tab: "register" });
          }
        } else {
          setError(data.error ?? "エラーが発生しました");
        }
      } else {
        setResult(data);
        if (guestToken) {
          localStorage.setItem("scriptai_guest_used", "true");
        }
        setLimitInfo((prev) =>
          prev && prev.remaining !== null
            ? { ...prev, remaining: Math.max(0, prev.remaining - 1) }
            : prev
        );
      }
    } catch {
      setError("通信エラーが発生しました。再試行してください。");
    } finally {
      setIsLoading(false);
    }
  }

  function handleAuthSuccess() {
    setAuthModal(null);
    window.location.reload();
  }

  // Stripe Checkout を起動
  async function handleUpgradeCheckout() {
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (res.status === 401) {
        setAuthModal({ tab: "register" });
        return;
      }
      if (res.ok && data.url) {
        window.location.href = data.url;
      }
    } catch {
      // 無視
    }
  }

  // 残り回数表示
  function renderRemainingDisplay() {
    if (!limitInfo) return null;
    const { remaining, limit, plan } = limitInfo;
    if (plan === "standard") {
      if (remaining === null || limit === null) return null;
      return (
        <p
          className={`text-center text-sm ${
            remaining === 0 ? "font-semibold text-red-500" : "text-indigo-600 font-medium"
          }`}
        >
          {remaining === 0 ? "今月の上限に達しました" : `✨ 今月の残り: ${remaining}/${limit}回`}
        </p>
      );
    }
    if (remaining === null || limit === null) return null;
    const label =
      plan === "guest"
        ? `無料お試し: 残り${remaining}/${limit}回`
        : `本日の残り: ${remaining}/${limit}回`;
    return (
      <p
        className={`text-center text-sm ${
          remaining === 0 ? "font-semibold text-red-500" : "text-gray-400"
        }`}
      >
        {label}
      </p>
    );
  }

  // 制限到達時メッセージ
  function renderLimitReached() {
    if (!limitInfo || limitInfo.remaining !== 0) return null;
    const { plan } = limitInfo;

    if (plan === "guest") {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 space-y-3 text-center">
          <p className="text-sm font-semibold text-blue-900">
            続けて使うには無料アカウント登録が必要です
          </p>
          <p className="text-xs text-blue-700">
            登録無料・メールアドレスのみ。登録後は1日2回まで使えます。
          </p>
          <button
            type="button"
            onClick={() => setAuthModal({ tab: "register" })}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            無料登録して続ける
          </button>
        </div>
      );
    }

    if (plan === "free") {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 space-y-3 text-center">
          <p className="text-sm font-medium text-amber-800">
            本日の無料枠を使い切りました。
          </p>
          <p className="text-xs text-gray-500 mb-1">
            スタンダードプラン（月額980円）なら月30回、企業分析・フローチャートも使えます。
          </p>
          <button
            type="button"
            onClick={handleUpgradeCheckout}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            スタンダードプランにアップグレード
          </button>
        </div>
      );
    }

    // standard plan limit
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-center">
        <p className="text-sm font-medium text-gray-700">
          今月の生成回数（30回）を使い切りました。
        </p>
        <p className="text-xs text-gray-400 mt-1">
          来月1日（UTC）にリセットされます。
        </p>
      </div>
    );
  }

  const isLimitReached = limitInfo?.remaining === 0;

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100 p-8 space-y-7"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">情報を入力する</h2>
          <p className="text-sm text-gray-500">必要事項を入力してスクリプトを生成します</p>
        </div>

        {/* 上部：無制限版登録バナー */}
        <a
          href="https://forms.gle/xPoQcpJBbGiiFGY39"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 transition-all group"
        >
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-indigo-200">現在 無料トライアル中（1日2回）</p>
            <p className="text-sm font-semibold">無制限版登録フォーム</p>
          </div>
          <svg
            className="h-5 w-5 shrink-0 opacity-80 group-hover:translate-x-0.5 transition-transform"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <IndustrySelect name="ownIndustry" label="自分の業種" />
          <IndustrySelect name="targetIndustry" label="ターゲットの業種" />

          {/* ターゲット企業名 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              ターゲット企業名
            </label>
            <input
              type="text"
              name="targetCompany"
              placeholder="例：株式会社〇〇"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>

          {/* ターゲットの部門 */}
          <div className="space-y-1.5 sm:col-start-2">
            <label className="block text-sm font-medium text-gray-700">
              ターゲットの部門
            </label>
            <input
              type="text"
              name="targetDepartment"
              list="department-options"
              placeholder="例：営業部、情報システム部"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            />
            <datalist id="department-options">
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          {/* 商材・サービス名 */}
          <div className="space-y-2 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              商材・サービス名 <span className="text-indigo-500">*</span>
            </label>
            <input
              type="text"
              name="product"
              required
              placeholder="例：クラウド型CRMシステム"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            />
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 transition hover:border-indigo-300 hover:bg-indigo-50/40 has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50">
              <input
                type="checkbox"
                name="webSearch"
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-indigo-600"
              />
              <span className="text-sm text-gray-600 leading-snug">
                Webで商材・サービスについて情報を検索して最適なスクリプトを生成する
              </span>
            </label>
          </div>

          {/* ターゲットの役職 */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              ターゲットの役職 <span className="text-indigo-500">*</span>
            </label>
            <select
              name="position"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            >
              <option value="">選択してください</option>
              {POSITIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 営業の目的 */}
        <div className="space-y-2.5">
          <label className="block text-sm font-medium text-gray-700">
            営業の目的 <span className="text-indigo-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PURPOSES.map(({ value, label }) => (
              <label
                key={value}
                className="relative flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 font-medium transition has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <input type="radio" name="purpose" value={value} required className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* 生成タイプ */}
        <div className="space-y-2.5">
          <label className="block text-sm font-medium text-gray-700">
            生成タイプ <span className="text-indigo-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SCRIPT_TYPES.map(({ value, label }) => (
              <label
                key={value}
                className="relative flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 font-medium transition has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <input type="radio" name="scriptType" value={value} required className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {renderRemainingDisplay()}

        {isLimitReached ? (
          renderLimitReached()
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-indigo-600 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                生成中...
              </span>
            ) : (
              "スクリプトを生成する"
            )}
          </button>
        )}

        {/* 下部：無制限版登録リンク（常時表示） */}
        <p className="text-center text-xs text-gray-400">
          正式版では無制限でご利用いただけます。{" "}
          <a
            href="https://forms.gle/xPoQcpJBbGiiFGY39"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-500 underline underline-offset-2 hover:text-indigo-600 transition-colors"
          >
            無制限版登録フォーム
          </a>
        </p>
      </form>

      {authModal && (
        <AuthModal
          defaultTab={authModal.tab}
          onSuccess={handleAuthSuccess}
          onClose={() => setAuthModal(null)}
        />
      )}

      {isLoading && (
        <div className="w-full max-w-2xl mx-auto rounded-2xl border border-indigo-100 bg-white p-10 flex flex-col items-center gap-4 shadow-xl shadow-indigo-100">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500">生成中・・・　営業Tipsを👇に掲載中</p>
        </div>
      )}

      {/* Tips カード：ローディング中は自動回転、完了後は最後の Tips を静止表示 */}
      {tipsVisible && (
        <LoadingTips key={generationKey} isLoading={isLoading} />
      )}

      {result && !isLoading && <ScriptResult result={result} />}
    </div>
  );
}
