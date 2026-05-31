"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import Navbar from "@/app/components/Navbar";
import type { Company, Contact, CompanyStatus, ContactRole } from "@/app/types/crm";
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
  "営業部", "マーケティング部", "経営企画部", "情報システム部・IT推進部",
  "人事部", "総務部", "経理・財務部", "購買・調達部",
  "開発・エンジニアリング部", "カスタマーサポート部", "法務部",
];

const POSITIONS = ["経営者・役員", "部長クラス", "課長・マネージャー", "担当者", "その他"];

// ── 共通スタイル ────────────────────────────────────────────

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

// ── 担当者フォームモーダル ──────────────────────────────────

function ContactFormModal({
  companyId,
  initialData,
  onClose,
  onSaved,
}: {
  companyId: string;
  initialData?: Contact;
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
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "保存に失敗しました"); return; }
      onSaved(isEdit ? data.contact : data.contact);
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
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass}>
                <option value="">選択</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>役職</label>
              <select value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass}>
                <option value="">選択</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
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
          {error && (
            <p className="rounded-[10px] bg-[#D9534F]/10 border border-[#D9534F]/30 px-3 py-2 text-xs text-[#D9534F]">{error}</p>
          )}
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
            {/* 架電状態アイコン（第2段階で色ロジック追加予定） */}
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
      {contact.notes && (
        <p className="text-xs text-[#4A5A6E] leading-relaxed bg-[#F6F4EE] rounded-[8px] px-3 py-2 mb-3">{contact.notes}</p>
      )}
      <button
        onClick={handleGenerateScript}
        className="w-full flex items-center justify-center gap-1.5 rounded-[10px] bg-[#C8FF3E] py-2 text-xs font-bold text-[#0F1B2D] hover:opacity-90 transition-opacity"
      >
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
  const [saving, setSaving] = useState(false);

  // 担当者
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [deleteContact, setDeleteContact] = useState<string | null>(null);
  const [deleteCompanyConfirm, setDeleteCompanyConfirm] = useState(false);

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
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  async function handleSave() {
    if (!company) return;
    setSaving(true);
    const res = await fetch(`/api/companies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ official_name: editName, industry: editIndustry, company_size: editSize, status: editStatus, notes: editNotes }),
    });
    const data = await res.json();
    if (res.ok) {
      setCompany({ ...company, ...data.company, contacts: company.contacts });
      setEditMode(false);
    }
    setSaving(false);
  }

  async function handleDeleteCompany() {
    const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
    if (res.ok) window.location.href = "/companies";
  }

  async function handleDeleteContact(contactId: string) {
    const res = await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      setDeleteContact(null);
    }
  }

  function handleContactSaved(contact: Contact) {
    setContacts((prev) => {
      const exists = prev.find((c) => c.id === contact.id);
      return exists ? prev.map((c) => c.id === contact.id ? contact : c) : [...prev, contact];
    });
    setShowContactForm(false);
    setEditingContact(undefined);
  }

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
            <a href="/companies" className="rounded-[12px] bg-[#0F1B2D] px-6 py-2.5 text-sm font-bold text-[#C8FF3E]">
              一覧に戻る
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* モーダル類 */}
      {(showContactForm || editingContact) && (
        <ContactFormModal
          companyId={id}
          initialData={editingContact}
          onClose={() => { setShowContactForm(false); setEditingContact(undefined); }}
          onSaved={handleContactSaved}
        />
      )}
      {deleteContact && (
        <DeleteModal
          label="担当者"
          onConfirm={() => handleDeleteContact(deleteContact)}
          onCancel={() => setDeleteContact(null)}
        />
      )}
      {deleteCompanyConfirm && (
        <DeleteModal
          label={`「${company.official_name}」とすべての担当者データ`}
          onConfirm={handleDeleteCompany}
          onCancel={() => setDeleteCompanyConfirm(false)}
        />
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
              <div className="flex items-center gap-2">
                {!editMode && <StatusBadge status={company.status} />}
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
                  <div>
                    <label className={labelClass}>メモ</label>
                    <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={4} className={`${inputClass} resize-none`} />
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
                  <div>
                    <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">登録日</p>
                    <p className="text-sm text-[#0F1B2D]">
                      {new Date(company.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider mb-1">最終更新</p>
                    <p className="text-sm text-[#0F1B2D]">
                      {new Date(company.updated_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
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

            {/* 企業削除 */}
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
            <div className="border-b border-[#E5E1D7] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0F1B2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-base font-black text-[#0F1B2D]">担当者</h2>
                <span className="text-xs text-[#4A5A6E]">{contacts.length}名</span>
              </div>
              <button
                onClick={() => { setEditingContact(undefined); setShowContactForm(true); }}
                className="flex items-center gap-1 text-xs font-bold text-[#0F1B2D] hover:opacity-70 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                担当者を追加
              </button>
            </div>
            <div className="p-4">
              {contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-[#4A5A6E] mb-3">まだ担当者が登録されていません</p>
                  <button
                    onClick={() => { setEditingContact(undefined); setShowContactForm(true); }}
                    className="rounded-[10px] border border-[#E5E1D7] px-4 py-2 text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors"
                  >
                    最初の担当者を追加
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contacts.map((c) => (
                    <ContactCard
                      key={c.id}
                      contact={c}
                      companyName={company.official_name}
                      onEdit={(ct) => { setEditingContact(ct); setShowContactForm(false); }}
                      onDelete={(cid) => setDeleteContact(cid)}
                    />
                  ))}
                </div>
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
              <a
                href="/#form"
                className="inline-flex items-center gap-1.5 mt-4 rounded-[10px] bg-[#C8FF3E] px-4 py-2 text-xs font-bold text-[#0F1B2D] hover:opacity-90 transition-opacity"
              >
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
