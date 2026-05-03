"use client";

import { useState, useEffect, useMemo } from "react";
import ScriptResult from "@/app/components/ScriptResult";
import type { HistoryEntry } from "@/app/lib/history";
import type { GenerateRequest } from "@/app/types/generate";

// FREE_HISTORY_LIMIT の値（型だけでなく値もインポートできないためハードコード）
const FREE_LIMIT = 5;

const INDUSTRIES = [
  "IT・Web", "不動産", "人材", "金融・保険", "製造業",
  "医療・ヘルスケア", "教育", "飲食・小売", "その他",
];

const PURPOSE_LABELS: Record<string, string> = {
  appointment: "アポイント獲得",
  hearing: "ヒアリング",
  proposal: "サービス提案",
  closing: "クロージング",
};

const SCRIPT_TYPE_LABELS: Record<string, string> = {
  call: "電話",
  email: "メール",
  both: "電話＋メール",
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── 削除確認ダイアログ ──────────────────────────────────────
function DeleteDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">履歴を削除しますか？</h3>
            <p className="text-sm text-gray-500">この操作は元に戻せません</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 詳細モーダル ────────────────────────────────────────────
function DetailModal({
  entry,
  onClose,
  onRegenerate,
}: {
  entry: HistoryEntry;
  onClose: () => void;
  onRegenerate: (inputs: GenerateRequest) => void;
}) {
  const { inputs, result, createdAt } = entry;
  const dept = inputs.targetDepartment || "各部門";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">
      {/* ヘッダー */}
      <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shadow-sm">
        <div>
          <p className="text-xs text-gray-400">{formatDate(createdAt)}</p>
          <h2 className="text-base font-bold text-gray-900 mt-0.5">
            {inputs.targetCompany
              ? `${inputs.targetCompany}｜${inputs.targetIndustry}`
              : inputs.targetIndustry}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {dept}・{inputs.position}・{PURPOSE_LABELS[inputs.purpose] ?? inputs.purpose}・
            {SCRIPT_TYPE_LABELS[inputs.scriptType] ?? inputs.scriptType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onRegenerate(inputs)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            この条件で再生成
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto">
        {/* 入力サマリー */}
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-indigo-700">
              自社：{inputs.ownIndustry}
            </span>
            <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-gray-600">
              商材：{inputs.product}
            </span>
            {inputs.targetCompany && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-amber-700">
                企業：{inputs.targetCompany}
              </span>
            )}
          </div>
        </div>

        {/* 生成結果 */}
        <ScriptResult result={result} />

        {/* モバイル用再生成ボタン */}
        <div className="sm:hidden max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => onRegenerate(inputs)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            この条件で再生成する
          </button>
        </div>
      </div>
    </div>
  );
}

// ── メインページ ────────────────────────────────────────────
export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [authed, setAuthed] = useState(false);

  // フィルター
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // UI state
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // 認証チェック
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          window.location.href = "/";
          return;
        }
        setUserPlan(data.user.plan);
        setAuthed(true);
      })
      .catch(() => { window.location.href = "/"; });

    // 履歴取得
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // フィルタリング
  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (entry.inputs.targetCompany ?? "").toLowerCase().includes(q) ||
        entry.inputs.product.toLowerCase().includes(q);
      const matchIndustry =
        !industryFilter || entry.inputs.targetIndustry === industryFilter;
      const matchFrom =
        !dateFrom || entry.createdAt >= new Date(dateFrom).getTime();
      const matchTo =
        !dateTo ||
        entry.createdAt <= new Date(dateTo + "T23:59:59").getTime();
      return matchSearch && matchIndustry && matchFrom && matchTo;
    });
  }, [entries, search, industryFilter, dateFrom, dateTo]);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function handleRegenerate(inputs: GenerateRequest) {
    sessionStorage.setItem("scriptai_prefill", JSON.stringify(inputs));
    window.location.href = "/#form";
  }

  if (!authed || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 詳細モーダル */}
      {selectedEntry && (
        <DetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onRegenerate={handleRegenerate}
        />
      )}

      {/* 削除確認 */}
      {deleteTarget && (
        <DeleteDialog
          onConfirm={() => !deleting && handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">

          {/* ページヘッダー */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">生成履歴</h1>
              <p className="text-sm text-gray-500 mt-1">
                {entries.length > 0
                  ? `${entries.length}件の履歴`
                  : "履歴はありません"}
              </p>
            </div>
            <a
              href="/#form"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新規生成
            </a>
          </div>

          {/* フリープランバナー */}
          {userPlan === "free" && entries.length > 0 && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-800">
                  フリープランは<strong>直近{FREE_LIMIT}件</strong>のみ保存されます。
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  スタンダードプランなら無制限に保存・閲覧できます。
                  <a href="/#pricing" className="underline ml-1 font-medium hover:text-amber-800">
                    プランを見る →
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* 検索・フィルター */}
          {entries.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
              {/* テキスト検索 */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="企業名・商材名で検索"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>

              {/* 業種フィルター */}
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full sm:w-44 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              >
                <option value="">すべての業種</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>

              {/* 日付範囲 */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 sm:w-36 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
                <span className="text-gray-400 text-sm shrink-0">〜</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 sm:w-36 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>

              {/* リセット */}
              {(search || industryFilter || dateFrom || dateTo) && (
                <button
                  onClick={() => { setSearch(""); setIndustryFilter(""); setDateFrom(""); setDateTo(""); }}
                  className="shrink-0 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  リセット
                </button>
              )}
            </div>
          )}

          {/* 空の状態 */}
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                まだ生成履歴がありません
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                スクリプトを生成すると自動的に保存されます
              </p>
              <a
                href="/#form"
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                スクリプトを生成する
              </a>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              条件に一致する履歴がありません
            </div>
          ) : (
            /* 履歴カード一覧 */
            <div className="space-y-3">
              {filtered.map((entry) => {
                const { inputs, createdAt, id } = entry;
                const dept = inputs.targetDepartment || "各部門";
                return (
                  <div
                    key={id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      {/* 左アクセントライン */}
                      <div className="w-1 shrink-0 bg-indigo-500 rounded-l-2xl" />

                      <div className="flex-1 p-5">
                        {/* 上段：日時 + バッジ */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <time className="text-xs text-gray-400 shrink-0">
                              {formatDate(createdAt)}
                            </time>
                            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[11px] font-medium text-indigo-600">
                              {inputs.targetIndustry}
                            </span>
                            <span className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                              {dept}
                            </span>
                            <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                              {PURPOSE_LABELS[inputs.purpose] ?? inputs.purpose}
                            </span>
                            <span className="rounded-full bg-violet-50 border border-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-600">
                              {SCRIPT_TYPE_LABELS[inputs.scriptType] ?? inputs.scriptType}
                            </span>
                          </div>

                          {/* 削除ボタン */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(id); }}
                            className="shrink-0 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="削除"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* 中段：企業名・商材 */}
                        <div className="space-y-1 mb-4">
                          {inputs.targetCompany && (
                            <p className="text-base font-bold text-gray-900">
                              {inputs.targetCompany}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            商材：{inputs.product}
                            <span className="mx-2 text-gray-300">|</span>
                            自社：{inputs.ownIndustry}
                            <span className="mx-2 text-gray-300">|</span>
                            {inputs.position}
                          </p>
                        </div>

                        {/* 詳細ボタン */}
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          生成結果を見る
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
