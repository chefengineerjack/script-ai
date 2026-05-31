"use client";

import { useState, useEffect, useCallback, use } from "react";
import Navbar from "@/app/components/Navbar";
import Combobox from "@/app/components/Combobox";
import OrgChart from "@/app/components/OrgChart";
import type { Company, Contact, CompanyStatus, ContactRole, ListingStatus, Department } from "@/app/types/crm";
import {
  COMPANY_STATUSES,
  COMPANY_SIZES,
  CONTACT_ROLES,
  STATUS_STYLE,
  ROLE_STYLE,
} from "@/app/types/crm";

const INDUSTRIES = [
  "IT・Web", "不動産", "人材", "金融・保険", "製造業",
  "医療・ヘルスケア", "教育", "飲食・小売", "その他",
];

const DEPARTMENTS = [
  "営業部", "営業企画部", "マーケティング部", "広報部",
  "情報システム部", "IT推進部", "DX推進部",
  "経営企画部", "事業企画部",
  "総務部", "人事部", "労務部",
  "経理部", "財務部",
  "購買部", "調達部",
  "生産管理部", "製造部", "品質管理部",
  "物流部", "サプライチェーン部",
  "研究開発部", "技術部",
  "カスタマーサポート部",
];

const POSITIONS = [
  "代表取締役", "取締役", "執行役員",
  "本部長", "部長", "副部長",
  "課長", "副課長", "係長",
  "主任", "リーダー",
  "担当", "スタッフ",
];

const LISTING_STATUSES: ListingStatus[] = ["上場", "非上場", "不明"];

type FetchedInfo = {
  industry: string | null;
  established_year: string | null;
  capital: string | null;
  headquarters: string | null;
  business_description: string | null;
  listing_status: string | null;
};

type FetchField = { key: keyof FetchedInfo; label: string };

const FETCH_FIELDS: FetchField[] = [
  { key: "industry", label: "業種" },
  { key: "established_year", label: "設立年" },
  { key: "capital", label: "資本金" },
  { key: "headquarters", label: "本社所在地" },
  { key: "business_description", label: "事業内容" },
  { key: "listing_status", label: "上場区分" },
];

const inputClass = "w-full rounded-[12px] border-[1.5px] border-[#E5E1D7] bg-white px-3.5 py-2.5 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition";
const labelClass = "block text-[11px] font-bold uppercase tracking-[1px] text-[#4A5A6E] mb-1.5";

// ── ステータスバッジ ────────────────────────────────────────

function StatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: ContactRole }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLE[role]}`}>
      {role}
    </span>
  );
}

// ── 公開情報確認モーダル ────────────────────────────────────

function FetchInfoModal({
  company,
  fetchedInfo,
  onApply,
  onClose,
}: {
  company: Company;
  fetchedInfo: FetchedInfo;
  onApply: (selected: Record<string, string | null>) => void;
  onClose: () => void;
}) {
  const currentValues: Record<string, string | null> = {
    industry: company.industry,
    established_year: company.established_year,
    capital: company.capital,
    headquarters: company.headquarters,
    business_description: company.business_description,
    listing_status: company.listing_status,
  };

  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    FETCH_FIELDS.forEach(({ key }) => { init[key] = fetchedInfo[key] != null; });
    return init;
  });

  function handleApply() {
    const selected: Record<string, string | null> = {};
    FETCH_FIELDS.forEach(({ key }) => { if (checked[key]) selected[key] = fetchedInfo[key]; });
    onApply(selected);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B2D]/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_24px_64px_rgba(15,27,45,0.2)] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#E5E1D7] px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-black text-[#0F1B2D]">公開情報を確認</h2>
            <p className="text-xs text-[#4A5A6E] mt-0.5">反映する項目にチェックを入れてください</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[#E5E1D7] transition-colors">
            <svg className="w-5 h-5 text-[#4A5A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {FETCH_FIELDS.map(({ key, label }) => {
            const fetched = fetchedInfo[key];
            const current = currentValues[key];
            const available = fetched != null;
            const hasDiff = available && current && current !== fetched;
            const isSame = available && current === fetched;
            return (
              <div key={key} className={`rounded-[12px] border p-4 ${available ? "border-[#E5E1D7] bg-white" : "border-[#E5E1D7] bg-[#F6F4EE] opacity-60"}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={checked[key] ?? false} disabled={!available} onChange={(e) => setChecked((prev) => ({ ...prev, [key]: e.target.checked }))} className="mt-0.5 accent-[#0F1B2D] w-4 h-4 shrink-0 cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A5A6E] mb-1">{label}</p>
                    {available ? (
                      <>
                        <p className="text-sm font-medium text-[#0F1B2D]">{fetched}</p>
                        {hasDiff && <p className="text-xs text-[#4A5A6E] mt-1">現在: <span className="line-through">{current}</span>{" → "}<span className="text-[#1F8A5B] font-semibold">{fetched}</span></p>}
                        {isSame && <p className="text-xs text-[#4A5A6E] mt-1">現在の値と同じです</p>}
                        {!current && !isSame && <p className="text-xs text-[#4A5A6E] mt-1">新規に設定されます</p>}
                      </>
                    ) : (
                      <p className="text-sm text-[#4A5A6E]">取得できませんでした</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-[#E5E1D7] px-6 py-4 shrink-0 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-[12px] border border-[#E5E1D7] py-2.5 text-sm font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors">キャンセル</button>
          <button onClick={handleApply} className="flex-1 rounded-[12px] bg-[#0F1B2D] py-2.5 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity">選択した項目を反映</button>
        </div>
      </div>
    </div>
  );
}

// ── 部署詳細モーダル ────────────────────────────────────────

function DeptDetailModal({
  dept,
  isExisting,
  contactDeptNames = [],
  onClose,
  onSave,
}: {
  dept: Department;
  isExisting: boolean;
  contactDeptNames?: string[];
  onClose: () => void;
  onSave: (updated: Department) => void;
}) {
  const [name, setName] = useState(dept.name);
  const [headCount, setHeadCount] = useState(dept.head_count);
  const [location, setLocation] = useState(dept.location);
  const [role, setRole] = useState(dept.role);
  const [painPoints, setPainPoints] = useState([...dept.pain_points]);
  const [newPP, setNewPP] = useState("");

  function handleSave() {
    onSave({ ...dept, name, head_count: headCount, location, role, pain_points: painPoints });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F1B2D]/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_24px_64px_rgba(15,27,45,0.2)] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#E5E1D7] px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-black text-[#0F1B2D]">部署詳細</h2>
            {!isExisting && <p className="text-xs text-amber-500 mt-0.5">※ 組織図を保存すると確定されます</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[#E5E1D7] transition-colors">
            <svg className="w-5 h-5 text-[#4A5A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>部署名</label>
            <Combobox
              value={name}
              onChange={setName}
              options={DEPARTMENTS}
              usedValues={contactDeptNames}
              usedLabel="担当者の入力済み部署名"
              optionsLabel="よく使われる部署名"
              placeholder="部署名を入力"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>人数</label>
              <input type="number" min={0} value={headCount} onChange={(e) => setHeadCount(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>所在地</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="東京本社" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>役割・ミッション</label>
            <textarea value={role} onChange={(e) => setRole(e.target.value)} rows={3} placeholder="この部署の役割" className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>ペインポイント</label>
            <div className="space-y-2">
              {painPoints.map((pp, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#F6F4EE] rounded-[10px] px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <p className="flex-1 text-sm text-[#0F1B2D]">{pp}</p>
                  <button onClick={() => setPainPoints((prev) => prev.filter((_, idx) => idx !== i))} className="text-[#D9534F] hover:opacity-70 transition-opacity">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPP}
                  onChange={(e) => setNewPP(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newPP.trim()) { setPainPoints((prev) => [...prev, newPP.trim()]); setNewPP(""); } }}
                  placeholder="ペインポイントを追加（Enter）"
                  className={inputClass}
                />
                <button
                  onClick={() => { if (newPP.trim()) { setPainPoints((prev) => [...prev, newPP.trim()]); setNewPP(""); } }}
                  className="shrink-0 rounded-[10px] bg-[#0F1B2D] px-3 text-xs font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#E5E1D7] px-6 py-4 shrink-0 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-[12px] border border-[#E5E1D7] py-2.5 text-sm font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors">キャンセル</button>
          <button onClick={handleSave} className="flex-1 rounded-[12px] bg-[#0F1B2D] py-2.5 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity">
            {isExisting ? "保存" : "適用"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ツリービューアイテム ────────────────────────────────────

function DeptTreeItem({
  dept,
  allDepts,
  depth,
  onSelect,
}: {
  dept: Department;
  allDepts: Department[];
  depth: number;
  onSelect: (dept: Department) => void;
}) {
  const children = allDepts.filter((d) => dept.children.includes(d.id));
  const dotColor = depth === 0 ? "bg-[#0F1B2D]" : depth === 1 ? "bg-blue-400" : depth === 2 ? "bg-teal-400" : "bg-gray-300";

  return (
    <>
      <div
        className="flex items-center gap-2 py-2.5 rounded-[10px] cursor-pointer hover:bg-[#F6F4EE] transition-colors group"
        style={{ paddingLeft: `${12 + depth * 20}px`, paddingRight: "12px" }}
        onClick={() => onSelect(dept)}
      >
        <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#0F1B2D]">{dept.name}</span>
            {dept.head_count > 0 && <span className="text-xs text-[#4A5A6E]">{dept.head_count}名</span>}
            {dept.pain_points.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 shrink-0">
                課題{dept.pain_points.length}件
              </span>
            )}
          </div>
          {dept.role && <p className="text-xs text-[#4A5A6E] truncate">{dept.role}</p>}
        </div>
        <svg className="w-4 h-4 text-[#E5E1D7] group-hover:text-[#4A5A6E] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      {children.map((child) => (
        <DeptTreeItem key={child.id} dept={child} allDepts={allDepts} depth={depth + 1} onSelect={onSelect} />
      ))}
    </>
  );
}

// ── 担当者フォームモーダル ──────────────────────────────────

function ContactFormModal({
  companyId,
  initialData,
  usedDepartments,
  usedPositions,
  onClose,
  onSaved,
}: {
  companyId: string;
  initialData?: Contact;
  usedDepartments: string[];
  usedPositions: string[];
  onClose: () => void;
  onSaved: (contact: Contact) => void;
}) {
  const isEdit = !!initialData;
  const [name, setName] = useState(initialData?.name ?? "");
  const [department, setDepartment] = useState(initialData?.department ?? "");
  const [position, setPosition] = useState(initialData?.position ?? "");
  const [role, setRole] = useState<ContactRole | "">(initialData?.role ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [infoSource, setInfoSource] = useState<"公開情報" | "手動入力">(initialData?.info_source ?? "手動入力");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = { company_id: companyId, name, department, position, role: role || null, email, phone, notes, info_source: infoSource };
      const url = isEdit ? `/api/contacts/${initialData!.id}` : "/api/contacts";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "保存に失敗しました"); return; }
      onSaved(data.contact);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B2D]/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_24px_64px_rgba(15,27,45,0.2)] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#E5E1D7] px-6 py-4 shrink-0">
          <h2 className="text-lg font-black text-[#0F1B2D]">{isEdit ? "担当者を編集" : "担当者を追加"}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[#E5E1D7] transition-colors">
            <svg className="w-5 h-5 text-[#4A5A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>氏名 <span className="text-[#D9534F]">*</span></label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="山田 太郎" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>部門</label>
              <Combobox value={department} onChange={setDepartment} options={DEPARTMENTS} usedValues={usedDepartments} usedLabel="この企業で使用済み" optionsLabel="よく使われる部署名" placeholder="部署名を入力または選択" />
            </div>
            <div>
              <label className={labelClass}>役職</label>
              <Combobox value={position} onChange={setPosition} options={POSITIONS} usedValues={usedPositions} usedLabel="この企業で使用済み" optionsLabel="よく使われる役職" placeholder="役職を入力または選択" />
            </div>
          </div>
          <div>
            <label className={labelClass}>ロール</label>
            <select value={role} onChange={(e) => setRole(e.target.value as ContactRole | "")} className={inputClass}>
              <option value="">選択</option>
              {CONTACT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>メールアドレス</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@company.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>電話番号</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03-0000-0000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>メモ</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="自由記述" className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>情報ソース</label>
            <div className="flex gap-4">
              {(["手動入力", "公開情報"] as const).map((src) => (
                <label key={src} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="infoSource" checked={infoSource === src} onChange={() => setInfoSource(src)} className="accent-[#0F1B2D]" />
                  <span className="text-sm text-[#0F1B2D]">{src}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="rounded-[10px] bg-[#D9534F]/10 border border-[#D9534F]/30 px-3 py-2 text-xs text-[#D9534F]">{error}</p>}
        </form>
        <div className="border-t border-[#E5E1D7] px-6 py-4 shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-[12px] border border-[#E5E1D7] py-2.5 text-sm font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors">キャンセル</button>
          <button onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={submitting} className="flex-1 rounded-[12px] bg-[#0F1B2D] py-2.5 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? "保存中..." : (isEdit ? "更新する" : "追加する")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 削除確認モーダル ────────────────────────────────────────

function DeleteModal({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B2D]/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_24px_64px_rgba(15,27,45,0.2)] p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#D9534F]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#D9534F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black text-[#0F1B2D]">削除しますか？</h3>
            <p className="text-sm text-[#4A5A6E] mt-1">{label}を削除します。この操作は元に戻せません。</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-[12px] border border-[#E5E1D7] py-2.5 text-sm font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors">キャンセル</button>
          <button onClick={onConfirm} className="flex-1 rounded-[12px] bg-[#D9534F] py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity">削除する</button>
        </div>
      </div>
    </div>
  );
}

// ── 担当者カード ────────────────────────────────────────────

function ContactCard({
  contact,
  companyName,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  companyName: string;
  onEdit: (c: Contact) => void;
  onDelete: (id: string) => void;
}) {
  function handleGenerateScript() {
    sessionStorage.setItem("scriptai_prefill", JSON.stringify({
      targetCompany: companyName,
      targetDepartment: contact.department ?? "",
      position: contact.position ?? "",
    }));
    window.location.href = "/#form";
  }

  return (
    <div className="rounded-[14px] border border-[#E5E1D7] bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-[#0F1B2D]">{contact.name}</p>
            {contact.role && <RoleBadge role={contact.role} />}
            <svg className="w-4 h-4 text-[#E5E1D7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {contact.department && <span className="text-xs text-[#4A5A6E]">{contact.department}</span>}
            {contact.position && <span className="text-xs text-[#4A5A6E]">{contact.position}</span>}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(contact)} className="rounded-[8px] p-1.5 border border-[#E5E1D7] hover:border-[#0F1B2D] transition-colors">
            <svg className="w-3.5 h-3.5 text-[#4A5A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => onDelete(contact.id)} className="rounded-[8px] p-1.5 border border-[#E5E1D7] hover:border-[#D9534F] transition-colors">
            <svg className="w-3.5 h-3.5 text-[#4A5A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#4A5A6E] mb-3">
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-[#0F1B2D]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {contact.email}
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-[#0F1B2D]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {contact.phone}
          </a>
        )}
        {contact.info_source === "公開情報" && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            公開情報
          </span>
        )}
      </div>
      {contact.notes && <p className="text-xs text-[#4A5A6E] leading-relaxed bg-[#F6F4EE] rounded-[8px] px-3 py-2 mb-3">{contact.notes}</p>}
      <button onClick={handleGenerateScript} className="w-full flex items-center justify-center gap-1.5 rounded-[10px] bg-[#C8FF3E] py-2 text-xs font-bold text-[#0F1B2D] hover:opacity-90 transition-opacity">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        このスクリプトを生成する
      </button>
    </div>
  );
}

// ── メインページ ────────────────────────────────────────────

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // 編集状態
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editStatus, setEditStatus] = useState<CompanyStatus>("未接触");
  const [editNotes, setEditNotes] = useState("");
  const [editEstablishedYear, setEditEstablishedYear] = useState("");
  const [editCapital, setEditCapital] = useState("");
  const [editHeadquarters, setEditHeadquarters] = useState("");
  const [editBusinessDescription, setEditBusinessDescription] = useState("");
  const [editListingStatus, setEditListingStatus] = useState<ListingStatus>("不明");
  const [saving, setSaving] = useState(false);

  // 公開情報取得
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [fetchedInfo, setFetchedInfo] = useState<FetchedInfo | null>(null);
  const [showFetchModal, setShowFetchModal] = useState(false);

  // 担当者
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [deleteContact, setDeleteContact] = useState<string | null>(null);
  const [deleteCompanyConfirm, setDeleteCompanyConfirm] = useState(false);

  // 部署・組織図
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [orgView, setOrgView] = useState<"tree" | "chart">("chart");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [existingDeptIds, setExistingDeptIds] = useState<Set<string>>(new Set());
  const [showCreateRoot, setShowCreateRoot] = useState(false);
  const [rootDeptName, setRootDeptName] = useState("");
  const [creatingRoot, setCreatingRoot] = useState(false);
  const [filteredDeptName, setFilteredDeptName] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    const res = await fetch(`/api/companies/${id}`);
    if (res.status === 404) { setNotFound(true); setLoading(false); return; }
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    const c: Company = data.company;
    setCompany(c);
    setContacts((c.contacts ?? []) as Contact[]);
    setEditName(c.official_name);
    setEditIndustry(c.industry ?? "");
    setEditSize(c.company_size ?? "");
    setEditStatus(c.status);
    setEditNotes(c.analysis_data?.notes ?? "");
    setEditEstablishedYear(c.established_year ?? "");
    setEditCapital(c.capital ?? "");
    setEditHeadquarters(c.headquarters ?? "");
    setEditBusinessDescription(c.business_description ?? "");
    setEditListingStatus(c.listing_status ?? "不明");
    setLoading(false);
  }, [id]);

  const fetchDepartments = useCallback(async () => {
    setLoadingDepts(true);
    try {
      const res = await fetch(`/api/companies/${id}/departments`);
      if (!res.ok) return;
      const data = await res.json();
      const rows: Omit<Department, "children">[] = data.departments ?? [];
      const depts: Department[] = rows.map((d) => ({
        ...d,
        children: rows.filter((c) => c.parent_id === d.id).map((c) => c.id),
      }));
      setDepartments(depts);
      setExistingDeptIds(new Set(depts.map((d) => d.id)));
    } finally {
      setLoadingDepts(false);
    }
  }, [id]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);
  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  async function handleSave() {
    if (!company) return;
    setSaving(true);
    const res = await fetch(`/api/companies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        official_name: editName, industry: editIndustry, company_size: editSize,
        status: editStatus, notes: editNotes,
        established_year: editEstablishedYear || null, capital: editCapital || null,
        headquarters: editHeadquarters || null, business_description: editBusinessDescription || null,
        listing_status: editListingStatus,
      }),
    });
    if (res.ok) { await fetchCompany(); setEditMode(false); }
    setSaving(false);
  }

  async function handleFetchInfo() {
    setFetchingInfo(true);
    try {
      const res = await fetch(`/api/companies/${id}/fetch-info`, { method: "POST" });
      const data = await res.json();
      if (res.ok) { setFetchedInfo(data.info); setShowFetchModal(true); }
    } finally {
      setFetchingInfo(false);
    }
  }

  async function handleApplyFetchedInfo(selected: Record<string, string | null>) {
    setSaving(true);
    const res = await fetch(`/api/companies/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selected) });
    if (res.ok) await fetchCompany();
    setShowFetchModal(false);
    setFetchedInfo(null);
    setSaving(false);
  }

  async function handleDeleteCompany() {
    const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
    if (res.ok) window.location.href = "/companies";
  }

  async function handleDeleteContact(contactId: string) {
    const res = await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });
    if (res.ok) { setContacts((prev) => prev.filter((c) => c.id !== contactId)); setDeleteContact(null); }
  }

  function handleContactSaved(contact: Contact) {
    setContacts((prev) => {
      const exists = prev.find((c) => c.id === contact.id);
      return exists ? prev.map((c) => c.id === contact.id ? contact : c) : [...prev, contact];
    });
    setShowContactForm(false);
    setEditingContact(undefined);
  }

  async function handleSaveOrgChart(current: Department[], deletedIds: string[]) {
    const res = await fetch(`/api/companies/${id}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departments: current, deletedIds }),
    });
    if (res.ok) await fetchDepartments();
  }

  async function handleUpdateDept(updated: Department) {
    setDepartments((prev) => prev.map((d) => d.id === updated.id ? { ...updated, children: d.children } : d));
    if (existingDeptIds.has(updated.id)) {
      await fetch(`/api/companies/${id}/departments/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: updated.name, head_count: updated.head_count, location: updated.location, role: updated.role, pain_points: updated.pain_points }),
      });
    }
    setSelectedDept(null);
  }

  async function handleCreateRootDept() {
    if (!rootDeptName.trim()) return;
    setCreatingRoot(true);
    const newId = crypto.randomUUID();
    const newDept: Department = {
      id: newId, company_id: id, name: rootDeptName.trim(),
      parent_id: null, head_count: 0, location: "", role: "", pain_points: [], children: [],
    };
    const res = await fetch(`/api/companies/${id}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departments: [newDept], deletedIds: [] }),
    });
    if (res.ok) { await fetchDepartments(); setShowCreateRoot(false); setRootDeptName(""); }
    setCreatingRoot(false);
  }

  const orgDeptNames = departments.map((d) => d.name);
  const contactDeptNames = [...new Set(contacts.map((c) => c.department).filter(Boolean))] as string[];
  const usedDepartments = [...new Set([...orgDeptNames, ...contactDeptNames.filter((n) => !orgDeptNames.includes(n))])];
  const usedPositions = [...new Set(contacts.map((c) => c.position).filter(Boolean))] as string[];
  const displayedContacts = filteredDeptName ? contacts.filter((c) => c.department === filteredDeptName) : contacts;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-[#E5E1D7] border-t-[#0F1B2D] animate-spin" />
        </div>
      </>
    );
  }

  if (notFound || !company) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-[#4A5A6E] mb-4">企業が見つかりません</p>
            <a href="/companies" className="rounded-[12px] bg-[#0F1B2D] px-6 py-2.5 text-sm font-bold text-[#C8FF3E]">一覧に戻る</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* モーダル類 */}
      {showFetchModal && fetchedInfo && (
        <FetchInfoModal company={company} fetchedInfo={fetchedInfo} onApply={handleApplyFetchedInfo} onClose={() => { setShowFetchModal(false); setFetchedInfo(null); }} />
      )}
      {selectedDept && (
        <DeptDetailModal
          dept={selectedDept}
          isExisting={existingDeptIds.has(selectedDept.id)}
          contactDeptNames={contactDeptNames}
          onClose={() => setSelectedDept(null)}
          onSave={handleUpdateDept}
        />
      )}
      {(showContactForm || editingContact) && (
        <ContactFormModal
          companyId={id}
          initialData={editingContact}
          usedDepartments={usedDepartments}
          usedPositions={usedPositions}
          onClose={() => { setShowContactForm(false); setEditingContact(undefined); }}
          onSaved={handleContactSaved}
        />
      )}
      {deleteContact && (
        <DeleteModal label="担当者" onConfirm={() => handleDeleteContact(deleteContact)} onCancel={() => setDeleteContact(null)} />
      )}
      {deleteCompanyConfirm && (
        <DeleteModal label={`「${company.official_name}」とすべての担当者データ`} onConfirm={handleDeleteCompany} onCancel={() => setDeleteCompanyConfirm(false)} />
      )}

      <div className="min-h-screen bg-[#F6F4EE]">
        <div className="mx-auto max-w-4xl px-4 py-8">

          {/* パンくず */}
          <div className="flex items-center gap-2 mb-6 text-sm text-[#4A5A6E]">
            <a href="/companies" className="hover:text-[#0F1B2D] transition-colors">企業マスタ</a>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[#0F1B2D] font-medium truncate">{company.official_name}</span>
          </div>

          {/* 企業情報カード */}
          <div className="bg-white rounded-[20px] border-2 border-[#0F1B2D] shadow-[0_8px_32px_rgba(15,27,45,0.08)] mb-6 overflow-hidden">
            <div className="border-b border-[#E5E1D7] bg-[#F6F4EE] px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏢</span>
                <div>
                  <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">企業情報</p>
                  {!editMode && <h1 className="text-xl font-black text-[#0F1B2D]">{company.official_name}</h1>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {!editMode && <StatusBadge status={company.status} />}
                {!editMode && (
                  <button onClick={handleFetchInfo} disabled={fetchingInfo} className="flex items-center gap-1.5 rounded-[10px] border border-[#E5E1D7] px-3 py-1.5 text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors disabled:opacity-50">
                    {fetchingInfo ? (
                      <><span className="inline-block h-3 w-3 rounded-full border-2 border-[#E5E1D7] border-t-[#0F1B2D] animate-spin" />取得中...</>
                    ) : <>🔍 公開情報を取得</>}
                  </button>
                )}
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 rounded-[10px] border border-[#E5E1D7] px-3 py-1.5 text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    編集
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditMode(false)} className="rounded-[10px] border border-[#E5E1D7] px-3 py-1.5 text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] transition-colors">キャンセル</button>
                    <button onClick={handleSave} disabled={saving} className="rounded-[10px] bg-[#0F1B2D] px-4 py-1.5 text-xs font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity disabled:opacity-50">
                      {saving ? "保存中..." : "保存"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {fetchingInfo && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-600">
                <svg className="w-4 h-4 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                ウェブから公開情報を取得しています。10〜30秒かかる場合があります...
              </div>
            )}

            <div className="p-6">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>企業名 <span className="text-[#D9534F]">*</span></label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>業種</label>
                      <select value={editIndustry} onChange={(e) => setEditIndustry(e.target.value)} className={inputClass}>
                        <option value="">選択</option>
                        {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>企業規模</label>
                      <select value={editSize} onChange={(e) => setEditSize(e.target.value)} className={inputClass}>
                        <option value="">選択</option>
                        {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>ステータス</label>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as CompanyStatus)} className={inputClass}>
                        {COMPANY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>設立年</label>
                      <input type="text" value={editEstablishedYear} onChange={(e) => setEditEstablishedYear(e.target.value)} placeholder="例：1995年" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>資本金</label>
                      <input type="text" value={editCapital} onChange={(e) => setEditCapital(e.target.value)} placeholder="例：1億円" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>上場区分</label>
                      <select value={editListingStatus} onChange={(e) => setEditListingStatus(e.target.value as ListingStatus)} className={inputClass}>
                        {LISTING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>本社所在地</label>
                    <input type="text" value={editHeadquarters} onChange={(e) => setEditHeadquarters(e.target.value)} placeholder="例：東京都渋谷区" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>事業内容</label>
                    <textarea value={editBusinessDescription} onChange={(e) => setEditBusinessDescription(e.target.value)} rows={2} placeholder="100字以内で事業内容を記載" className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>メモ</label>
                    <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">業種</p>
                    <p className="text-sm text-[#0F1B2D]">{company.industry ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">企業規模</p>
                    <p className="text-sm text-[#0F1B2D]">{company.company_size ?? "—"}</p>
                  </div>
                  {company.established_year && (
                    <div>
                      <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">設立年</p>
                      <p className="text-sm text-[#0F1B2D]">{company.established_year}</p>
                    </div>
                  )}
                  {company.capital && (
                    <div>
                      <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">資本金</p>
                      <p className="text-sm text-[#0F1B2D]">{company.capital}</p>
                    </div>
                  )}
                  {company.listing_status && company.listing_status !== "不明" && (
                    <div>
                      <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">上場区分</p>
                      <p className="text-sm text-[#0F1B2D]">{company.listing_status}</p>
                    </div>
                  )}
                  {company.headquarters && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">本社所在地</p>
                      <p className="text-sm text-[#0F1B2D]">{company.headquarters}</p>
                    </div>
                  )}
                  {company.business_description && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">事業内容</p>
                      <p className="text-sm text-[#0F1B2D] leading-relaxed">{company.business_description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">登録日</p>
                    <p className="text-sm text-[#0F1B2D]">{new Date(company.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">最終更新</p>
                    <p className="text-sm text-[#0F1B2D]">{new Date(company.updated_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  {company.analysis_data?.notes && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">メモ</p>
                      <p className="text-sm text-[#0F1B2D] whitespace-pre-wrap leading-relaxed">{company.analysis_data.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!editMode && (
              <div className="border-t border-[#E5E1D7] px-6 py-3 flex justify-end">
                <button onClick={() => setDeleteCompanyConfirm(true)} className="flex items-center gap-1.5 text-xs text-[#D9534F] hover:opacity-70 transition-opacity">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  この企業を削除
                </button>
              </div>
            )}
          </div>

          {/* 担当者セクション */}
          <div className="bg-white rounded-[20px] border border-[#E5E1D7] shadow-[0_4px_16px_rgba(15,27,45,0.04)] mb-6 overflow-hidden">
            <div className="border-b border-[#E5E1D7] px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <svg className="w-5 h-5 text-[#0F1B2D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-base font-black text-[#0F1B2D]">担当者</h2>
                <span className="text-xs text-[#4A5A6E]">
                  {filteredDeptName ? `${displayedContacts.length}名（${filteredDeptName}）` : `${contacts.length}名`}
                </span>
                {filteredDeptName && (
                  <span className="inline-flex items-center gap-1 text-xs bg-[#0F1B2D] text-[#C8FF3E] rounded-full px-2.5 py-1 font-medium">
                    {filteredDeptName}でフィルタ中
                    <button
                      onClick={() => { setFilteredDeptName(null); setSelectedDept(null); }}
                      className="ml-0.5 rounded-full hover:opacity-70 transition-opacity p-0.5"
                      aria-label="フィルタを解除"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
              <button onClick={() => { setEditingContact(undefined); setShowContactForm(true); }} className="flex items-center gap-1 text-xs font-bold text-[#0F1B2D] hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                担当者を追加
              </button>
            </div>
            <div className="p-4">
              {displayedContacts.length === 0 ? (
                filteredDeptName ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-[#4A5A6E] mb-2">「{filteredDeptName}」の担当者はまだ登録されていません</p>
                    <button
                      onClick={() => { setFilteredDeptName(null); setSelectedDept(null); }}
                      className="text-xs text-[#0F1B2D] underline underline-offset-2 hover:opacity-70 transition-opacity"
                    >
                      フィルタを解除して全担当者を表示
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-[#4A5A6E] mb-3">まだ担当者が登録されていません</p>
                    <button onClick={() => { setEditingContact(undefined); setShowContactForm(true); }} className="rounded-[10px] border border-[#E5E1D7] px-4 py-2 text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors">
                      最初の担当者を追加
                    </button>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayedContacts.map((c) => (
                    <ContactCard key={c.id} contact={c} companyName={company.official_name} onEdit={(ct) => { setEditingContact(ct); setShowContactForm(false); }} onDelete={(cid) => setDeleteContact(cid)} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 部署・組織図セクション */}
          <div className="bg-white rounded-[20px] border border-[#E5E1D7] shadow-[0_4px_16px_rgba(15,27,45,0.04)] mb-6 overflow-hidden">
            <div className="border-b border-[#E5E1D7] px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0F1B2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h2 className="text-base font-black text-[#0F1B2D]">部署・組織図</h2>
                <span className="text-xs text-[#4A5A6E]">{departments.length}部署</span>
              </div>
              {departments.length > 0 && (
                <div className="flex items-center gap-1 bg-[#F6F4EE] rounded-[10px] p-1">
                  {(["tree", "chart"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setOrgView(v)}
                      className={`px-3 py-1 rounded-[8px] text-xs font-medium transition-colors ${orgView === v ? "bg-white text-[#0F1B2D] shadow-sm" : "text-[#4A5A6E] hover:text-[#0F1B2D]"}`}
                    >
                      {v === "tree" ? "ツリー" : "組織図"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {loadingDepts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 rounded-full border-4 border-[#E5E1D7] border-t-[#0F1B2D] animate-spin" />
                </div>
              ) : departments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#F6F4EE] flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-[#4A5A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#4A5A6E] mb-4">まだ組織図が作成されていません</p>
                  {showCreateRoot ? (
                    <div className="flex items-center gap-2 w-full max-w-xs">
                      <input
                        type="text"
                        value={rootDeptName}
                        onChange={(e) => setRootDeptName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateRootDept()}
                        placeholder="本部・部署名を入力"
                        autoFocus
                        className="flex-1 rounded-[12px] border-[1.5px] border-[#E5E1D7] px-3 py-2 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10"
                      />
                      <button
                        onClick={handleCreateRootDept}
                        disabled={!rootDeptName.trim() || creatingRoot}
                        className="rounded-[12px] bg-[#0F1B2D] px-3 py-2 text-xs font-bold text-[#C8FF3E] hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        {creatingRoot ? "作成中..." : "作成"}
                      </button>
                      <button onClick={() => setShowCreateRoot(false)} className="text-xs text-[#4A5A6E] hover:text-[#0F1B2D]">キャンセル</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCreateRoot(true)}
                      className="flex items-center gap-1.5 rounded-[12px] border border-[#E5E1D7] px-4 py-2 text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      組織図を作成する
                    </button>
                  )}
                </div>
              ) : orgView === "tree" ? (
                <div className="space-y-0.5">
                  {departments.filter((d) => d.parent_id === null).map((root) => (
                    <DeptTreeItem key={root.id} dept={root} allDepts={departments} depth={0} onSelect={(d) => {
                      const isToggling = selectedDept?.id === d.id;
                      setSelectedDept(isToggling ? null : d);
                      setFilteredDeptName(isToggling ? null : d.name);
                    }} />
                  ))}
                </div>
              ) : (
                <OrgChart
                  departments={departments}
                  contacts={contacts}
                  selectedId={selectedDept?.id}
                  onSelect={(dept) => {
                    const isToggling = selectedDept?.id === dept.id;
                    setSelectedDept(isToggling ? null : dept);
                    setFilteredDeptName(isToggling ? null : dept.name);
                  }}
                  onSave={handleSaveOrgChart}
                />
              )}
            </div>
          </div>

          {/* スクリプト履歴（プレースホルダー） */}
          <div className="bg-white rounded-[20px] border border-[#E5E1D7] shadow-[0_4px_16px_rgba(15,27,45,0.04)] mb-6 overflow-hidden">
            <div className="border-b border-[#E5E1D7] px-6 py-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0F1B2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-base font-black text-[#0F1B2D]">スクリプト生成履歴</h2>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-[#4A5A6E]">スクリプト生成履歴とのリンク機能は近日追加予定です</p>
              <a href="/#form" className="inline-flex items-center gap-1.5 mt-4 rounded-[10px] bg-[#C8FF3E] px-4 py-2 text-xs font-bold text-[#0F1B2D] hover:opacity-90 transition-opacity">
                スクリプトを生成する
              </a>
            </div>
          </div>

          {/* 架電履歴（第2段階プレースホルダー） */}
          <div className="bg-white rounded-[20px] border border-[#E5E1D7] shadow-[0_4px_16px_rgba(15,27,45,0.04)] overflow-hidden">
            <div className="border-b border-[#E5E1D7] px-6 py-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0F1B2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <h2 className="text-base font-black text-[#0F1B2D]">架電履歴</h2>
              <span className="text-xs bg-[#FFE8A3]/60 text-amber-700 rounded-full px-2 py-0.5 font-semibold">第2段階</span>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-[#4A5A6E]">架電履歴の記録・管理機能は第2段階で追加予定です</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
