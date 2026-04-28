"use client";

import { useState, useEffect } from "react";
import ScriptResult from "@/app/components/ScriptResult";
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

export default function ScriptForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  // ページ読み込み時に残り回数を取得
  useEffect(() => {
    fetch("/api/limit")
      .then((r) => r.json())
      .then((data) => setRemaining(data.remaining))
      .catch(() => {}); // 取得失敗時は非表示のまま（制限なしとして扱う）
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

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

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          // 制限到達：ボタンエリアのUIで表示するためremainingを0にセット
          setRemaining(0);
        } else {
          setError(data.error ?? "エラーが発生しました");
        }
      } else {
        setResult(data);
        // 成功後にローカルのカウンタを減らす
        setRemaining((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
      }
    } catch {
      setError("通信エラーが発生しました。再試行してください。");
    } finally {
      setIsLoading(false);
    }
  }

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
            <p className="text-[11px] font-medium text-indigo-200">現在 無料トライアル中（1日3回）</p>
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

        {/* 残り回数 */}
        {remaining !== null && (
          <p
            className={`text-center text-sm ${
              remaining === 0
                ? "text-red-500 font-semibold"
                : "text-gray-400"
            }`}
          >
            本日の残り生成回数: {remaining}/3回
          </p>
        )}

        {/* 制限到達時：メッセージ表示。それ以外：送信ボタン表示 */}
        {remaining === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 space-y-1.5 text-center">
            <p className="text-sm font-medium text-amber-800">
              本日の無料枠を使い切りました。毎日3回まで無料でお試しいただけます。
            </p>
            <p className="text-xs text-gray-500">
              ※正式版では無制限でご利用いただけます。{" "}
              <a
                href="https://forms.gle/xPoQcpJBbGiiFGY39"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline hover:text-indigo-500 transition-colors"
              >
                無制限版登録フォーム
              </a>
            </p>
          </div>
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
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
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

      {isLoading && (
        <div className="w-full max-w-2xl mx-auto rounded-2xl border border-indigo-100 bg-white p-10 flex flex-col items-center gap-4 shadow-xl shadow-indigo-100">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500">AIがスクリプトを生成しています...</p>
        </div>
      )}

      {result && !isLoading && <ScriptResult result={result} />}
    </div>
  );
}
