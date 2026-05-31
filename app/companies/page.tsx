"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/app/components/Navbar";
import type { Company, CompanyStatus } from "@/app/types/crm";
import { COMPANY_STATUSES, COMPANY_SIZES, STATUS_STYLE } from "@/app/types/crm";

const INDUSTRIES = [
  "IT・Web", "不動産", "人材", "金融・保険", "製造業",
  "医療・ヘルスケア", "教育", "飲食・小売", "その他",
];

// ── ステータスバッジ ────────────────────────────────────────

function StatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

// ── 重複チェックモーダル ────────────────────────────────────

function DuplicateModal({
  existingName,
  existingId,
  onOpenExisting,
  onContinue,
}: {
  existingName: string;
  existingId: string;
  onOpenExisting: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B2D]/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_24px_64px_rgba(15,27,45,0.2)] p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FFE8A3]/60 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black text-[#0F1B2D]">既存データが見つかりました</h3>
            <p className="text-sm text-[#4A5A6E] mt-1">
              「{existingName}」のデータが既に存在します。同じ企業ですか？
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-5">
          <button
            onClick={() => onOpenExisting(existingId)}
            className="w-full rounded-[12px] bg-[#0F1B2D] py-2.5 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity"
          >
            既存データを開く
          </button>
          <button
            onClick={onContinue}
            className="w-full rounded-[12px] border border-[#E5E1D7] py-2.5 text-sm font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors"
          >
            別の企業として登録する
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 企業登録フォーム（スライドパネル）─────────────────────

function CompanyFormPanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (company: Company) => void;
}) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [status, setStatus] = useState<CompanyStatus>("未接触");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [duplicate, setDuplicate] = useState<{ id: string; official_name: string } | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkDuplicate = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setDuplicate(null); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/companies/check-duplicate?name=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (data.duplicate) {
        setDuplicate(data.duplicate);
        setBypassDuplicate(false);
      } else {
        setDuplicate(null);
      }
    }, 350);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (duplicate && !bypassDuplicate) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ official_name: name, industry, company_size: companySize, status, notes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "登録に失敗しました"); return; }
      onCreated(data.company);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full rounded-[12px] border-[1.5px] border-[#E5E1D7] bg-white px-3.5 py-2.5 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition";
  const labelClass = "block text-[11px] font-bold uppercase tracking-[1px] text-[#4A5A6E] mb-1.5";

  return (
    <>
      {duplicate && !bypassDuplicate && (
        <DuplicateModal
          existingName={duplicate.official_name}
          existingId={duplicate.id}
          onOpenExisting={(id) => { window.location.href = `/companies/${id}`; }}
          onContinue={() => setBypassDuplicate(true)}
        />
      )}

      {/* オーバーレイ */}
      <div className="fixed inset-0 z-30 bg-[#0F1B2D]/30" onClick={onClose} />

      {/* スライドパネル */}
      <div className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-white shadow-[0_0_48px_rgba(15,27,45,0.15)] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#E5E1D7] px-6 py-4 shrink-0">
          <h2 className="text-lg font-black text-[#0F1B2D]">企業を追加</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[#E5E1D7] transition-colors">
            <svg className="w-5 h-5 text-[#4A5A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>企業名 <span className="text-[#D9534F]">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); checkDuplicate(e.target.value); }}
              placeholder="例：株式会社○○"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>業種</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>企業規模</label>
            <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>ステータス</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as CompanyStatus)} className={inputClass}>
              {COMPANY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>メモ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="自由記述"
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <p className="rounded-[10px] bg-[#D9534F]/10 border border-[#D9534F]/30 px-3 py-2 text-xs text-[#D9534F]">
              {error}
            </p>
          )}
        </form>

        <div className="border-t border-[#E5E1D7] px-6 py-4 shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[12px] border border-[#E5E1D7] py-2.5 text-sm font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={submitting}
            className="flex-1 rounded-[12px] bg-[#0F1B2D] py-2.5 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "登録中..." : "登録する"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── 企業カード ──────────────────────────────────────────────

function CompanyCard({ company, view }: { company: Company; view: "grid" | "list" }) {
  const notes = company.analysis_data?.notes;
  const date = new Date(company.created_at).toLocaleDateString("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });

  if (view === "list") {
    return (
      <a
        href={`/companies/${company.id}`}
        className="flex items-center gap-4 rounded-[14px] border border-[#E5E1D7] bg-white px-5 py-3.5 hover:border-[#0F1B2D] hover:shadow-[0_4px_16px_rgba(15,27,45,0.08)] transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-[#0F1B2D] truncate">{company.official_name}</span>
            <StatusBadge status={company.status} />
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {company.industry && <span className="text-xs text-[#4A5A6E]">{company.industry}</span>}
            {company.company_size && <span className="text-xs text-[#4A5A6E]">{company.company_size}</span>}
            {notes && <span className="text-xs text-[#4A5A6E] truncate max-w-xs">{notes}</span>}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-4 text-xs text-[#4A5A6E]">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {company.contact_count ?? 0}名
          </span>
          <span>{date}</span>
          <svg className="w-4 h-4 text-[#E5E1D7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>
    );
  }

  return (
    <a
      href={`/companies/${company.id}`}
      className="flex flex-col rounded-[16px] border border-[#E5E1D7] bg-white p-5 hover:border-[#0F1B2D] hover:shadow-[0_4px_16px_rgba(15,27,45,0.08)] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-[#0F1B2D] leading-tight">{company.official_name}</p>
          {company.industry && (
            <p className="text-xs text-[#4A5A6E] mt-0.5">{company.industry}{company.company_size ? ` · ${company.company_size}` : ""}</p>
          )}
        </div>
        <StatusBadge status={company.status} />
      </div>
      {notes && (
        <p className="text-xs text-[#4A5A6E] leading-relaxed line-clamp-2 mb-3 flex-1">{notes}</p>
      )}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#E5E1D7]">
        <span className="flex items-center gap-1 text-xs text-[#4A5A6E]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {company.contact_count ?? 0}名
        </span>
        <span className="text-xs text-[#4A5A6E]">{date}</span>
      </div>
    </a>
  );
}

// ── メインページ ────────────────────────────────────────────

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [authError, setAuthError] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/companies?${params}`);
    if (res.status === 401) { setAuthError(true); setLoading(false); return; }
    const data = await res.json();
    setCompanies(data.companies ?? []);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  function handleCreated(company: Company) {
    setShowForm(false);
    window.location.href = `/companies/${company.id}`;
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#4A5A6E] mb-4">ログインが必要です</p>
          <a href="/" className="rounded-[12px] bg-[#0F1B2D] px-6 py-2.5 text-sm font-bold text-[#C8FF3E]">
            トップページへ
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {showForm && (
        <CompanyFormPanel onClose={() => setShowForm(false)} onCreated={handleCreated} />
      )}

      <div className="min-h-screen bg-[#F6F4EE]">
        <div className="mx-auto max-w-6xl px-4 py-8">

          {/* ページヘッダー */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-[#0F1B2D]">企業マスタ</h1>
              <p className="text-sm text-[#4A5A6E] mt-0.5">
                {loading ? "読み込み中..." : `${companies.length}社`}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 rounded-[12px] bg-[#0F1B2D] px-4 py-2.5 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              企業を追加
            </button>
          </div>

          {/* フィルター・検索バー */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="企業名で検索"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[12px] border border-[#E5E1D7] bg-white pl-10 pr-4 py-2.5 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-[12px] border border-[#E5E1D7] bg-white px-3.5 py-2.5 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition"
            >
              <option value="">すべてのステータス</option>
              {COMPANY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {/* ビュー切替 */}
            <div className="flex rounded-[12px] border border-[#E5E1D7] overflow-hidden bg-white shrink-0">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-2 transition-colors ${view === v ? "bg-[#0F1B2D] text-[#C8FF3E]" : "text-[#4A5A6E] hover:text-[#0F1B2D]"}`}
                >
                  {v === "grid" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* コンテンツ */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 rounded-full border-4 border-[#E5E1D7] border-t-[#0F1B2D] animate-spin" />
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-[16px] bg-[#C8FF3E]/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#0F1B2D]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-base font-black text-[#0F1B2D] mb-1">
                {search || statusFilter ? "条件に合う企業がありません" : "まだ企業が登録されていません"}
              </h3>
              <p className="text-sm text-[#4A5A6E] max-w-xs mb-6">
                {search || statusFilter ? "検索条件を変更してみてください" : "「企業を追加」から最初の企業を登録しましょう"}
              </p>
              {!search && !statusFilter && (
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-[12px] bg-[#0F1B2D] px-6 py-2.5 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity"
                >
                  企業を追加する
                </button>
              )}
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((c) => <CompanyCard key={c.id} company={c} view="grid" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {companies.map((c) => <CompanyCard key={c.id} company={c} view="list" />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
