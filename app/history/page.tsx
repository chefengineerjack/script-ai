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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B2D]/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_24px_64px_rgba(15,27,45,0.2)] p-6 mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#D9534F]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#D9534F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black text-[#0F1B2D]">履歴を削除しますか？</h3>
            <p className="text-sm text-[#4A5A6E]">この操作は元に戻せません</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-[12px] border border-[#E5E1D7] py-2.5 text-sm font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-[12px] bg-[#D9534F] py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F6F4EE] overflow-hidden">
      {/* ヘッダー */}
      <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#E5E1D7] bg-[#F6F4EE] shadow-sm">
        <div>
          <p className="text-xs text-[#4A5A6E]">{formatDate(createdAt)}</p>
          <h2 className="text-base font-black text-[#0F1B2D] mt-0.5">
            {inputs.targetCompany
              ? `${inputs.targetCompany}｜${inputs.targetIndustry}`
              : inputs.targetIndustry}
          </h2>
          <p className="text-xs text-[#4A5A6E] mt-0.5">
            {dept}・{inputs.position}・{PURPOSE_LABELS[inputs.purpose] ?? inputs.purpose}・
            {SCRIPT_TYPE_LABELS[inputs.scriptType] ?? inputs.scriptType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onRegenerate(inputs)}
            className="hidden sm:flex items-center gap-1.5 rounded-[12px] bg-[#0F1B2D] px-4 py-2 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            この条件で再生成
          </button>
          <button
            onClick={onClose}
            className="rounded-[12px] border border-[#E5E1D7] p-2 text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors"
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
            <span className="rounded-full bg-[#C8FF3E]/20 border border-[#C8FF3E]/40 px-3 py-1 text-[#0F1B2D] font-medium">
              自社：{inputs.ownIndustry}
            </span>
            <span className="rounded-full bg-[#E5E1D7] border border-[#E5E1D7] px-3 py-1 text-[#4A5A6E] font-medium">
              商材：{inputs.product}
            </span>
            {inputs.targetCompany && (
              <span className="rounded-full bg-[#FFE8A3]/60 border border-[#FFE8A3] px-3 py-1 text-[#0F1B2D] font-medium">
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
            className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-[#0F1B2D] py-4 text-sm font-black text-[#C8FF3E] hover:opacity-90 transition-opacity"
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
      <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-[#E5E1D7] border-t-[#0F1B2D] animate-spin" />
          <p className="text-sm text-[#4A5A6E]">読み込み中...</p>
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

      <div className="min-h-screen bg-[#F6F4EE]">
        <div className="mx-auto max-w-4xl px-4 py-10">

          {/* ページヘッダー */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#0F1B2D]">生成履歴</h1>
              <p className="text-sm text-[#4A5A6E] mt-1">
                {entries.length > 0
                  ? `${entries.length}件の履歴`
                  : "履歴はありません"}
              </p>
            </div>
            <a
              href="/#form"
              className="flex items-center gap-1.5 rounded-[12px] bg-[#0F1B2D] px-4 py-2.5 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新規生成
            </a>
          </div>

          {/* フリープランバナー */}
          {userPlan === "free" && entries.length > 0 && (
            <div className="mb-6 flex items-start gap-3 rounded-[14px] border border-[#FFE8A3] bg-[#FFE8A3]/40 px-4 py-3">
              <svg className="w-5 h-5 text-[#0F1B2D] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0F1B2D] font-medium">
                  フリープランは<strong>直近{FREE_LIMIT}件</strong>のみ保存されます。
                </p>
                <p className="text-xs text-[#4A5A6E] mt-0.5">
                  スタンダードプランなら無制限に保存・閲覧できます。
                  <a href="/#pricing" className="underline ml-1 font-medium hover:text-[#0F1B2D] transition-colors">
                    プランを見る →
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* 検索・フィルター */}
          {entries.length > 0 && (
            <div className="mb-6 bg-white rounded-[16px] border border-[#E5E1D7] shadow-[0_2px_8px_rgba(15,27,45,0.06)] p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
              {/* テキスト検索 */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="企業名・商材名で検索"
                  className="w-full rounded-[10px] border border-[#E5E1D7] bg-[#F6F4EE] pl-9 pr-3.5 py-2 text-sm text-[#0F1B2D] placeholder:text-[#4A5A6E]/40 focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition"
                />
              </div>

              {/* 業種フィルター */}
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full sm:w-44 rounded-[10px] border border-[#E5E1D7] bg-[#F6F4EE] px-3 py-2 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition"
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
                  className="flex-1 sm:w-36 rounded-[10px] border border-[#E5E1D7] bg-[#F6F4EE] px-3 py-2 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition"
                />
                <span className="text-[#4A5A6E] text-sm shrink-0">〜</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 sm:w-36 rounded-[10px] border border-[#E5E1D7] bg-[#F6F4EE] px-3 py-2 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition"
                />
              </div>

              {/* リセット */}
              {(search || industryFilter || dateFrom || dateTo) && (
                <button
                  onClick={() => { setSearch(""); setIndustryFilter(""); setDateFrom(""); setDateTo(""); }}
                  className="shrink-0 text-sm text-[#4A5A6E] hover:text-[#0F1B2D] transition-colors"
                >
                  リセット
                </button>
              )}
            </div>
          )}

          {/* 空の状態 */}
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-[16px] bg-[#C8FF3E]/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#0F1B2D]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-black text-[#0F1B2D] mb-1">
                まだ生成履歴がありません
              </h3>
              <p className="text-sm text-[#4A5A6E] max-w-xs">
                スクリプトを生成すると自動的に保存されます
              </p>
              <a
                href="/#form"
                className="mt-6 rounded-[12px] bg-[#0F1B2D] px-6 py-2.5 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity"
              >
                スクリプトを生成する
              </a>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#4A5A6E] text-sm">
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
                    className="group bg-white rounded-[16px] border border-[#E5E1D7] hover:border-[#0F1B2D] hover:shadow-[0_8px_32px_rgba(15,27,45,0.08)] transition-all overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      {/* 左アクセントライン */}
                      <div className="w-1 shrink-0 bg-[#C8FF3E] rounded-l-[16px]" />

                      <div className="flex-1 p-5">
                        {/* 上段：日時 + バッジ */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <time className="text-xs text-[#4A5A6E] shrink-0">
                              {formatDate(createdAt)}
                            </time>
                            <span className="rounded-full bg-[#C8FF3E]/20 border border-[#C8FF3E]/40 px-2.5 py-0.5 text-[11px] font-medium text-[#0F1B2D]">
                              {inputs.targetIndustry}
                            </span>
                            <span className="rounded-full bg-[#E5E1D7] border border-[#E5E1D7] px-2.5 py-0.5 text-[11px] font-medium text-[#4A5A6E]">
                              {dept}
                            </span>
                            <span className="rounded-full bg-[#1F8A5B]/10 border border-[#1F8A5B]/30 px-2.5 py-0.5 text-[11px] font-medium text-[#1F8A5B]">
                              {PURPOSE_LABELS[inputs.purpose] ?? inputs.purpose}
                            </span>
                            <span className="rounded-full bg-[#FFE8A3]/60 border border-[#FFE8A3] px-2.5 py-0.5 text-[11px] font-medium text-[#0F1B2D]">
                              {SCRIPT_TYPE_LABELS[inputs.scriptType] ?? inputs.scriptType}
                            </span>
                          </div>

                          {/* 削除ボタン */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(id); }}
                            className="shrink-0 p-1.5 text-[#E5E1D7] hover:text-[#D9534F] hover:bg-[#D9534F]/10 rounded-[8px] transition-colors"
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
                            <p className="text-base font-black text-[#0F1B2D]">
                              {inputs.targetCompany}
                            </p>
                          )}
                          <p className="text-sm text-[#4A5A6E]">
                            商材：{inputs.product}
                            <span className="mx-2 text-[#E5E1D7]">|</span>
                            自社：{inputs.ownIndustry}
                            <span className="mx-2 text-[#E5E1D7]">|</span>
                            {inputs.position}
                          </p>
                        </div>

                        {/* 詳細ボタン */}
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="flex items-center gap-1.5 text-sm font-bold text-[#0F1B2D] hover:text-[#0F1B2D] hover:gap-2.5 transition-all"
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
