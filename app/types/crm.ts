export const COMPANY_STATUSES = [
  "未接触",
  "アプローチ中",
  "商談中",
  "契約済み",
  "失注",
  "アプローチ停止",
  "時期を置いてアプローチ",
] as const;

export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const CONTACT_ROLES = [
  "キーマン",
  "決裁者",
  "推進者",
  "反対者",
  "情報収集者",
] as const;

export type ContactRole = (typeof CONTACT_ROLES)[number];

export const COMPANY_SIZES = [
  "〜50名",
  "51〜200名",
  "201〜1000名",
  "1001名以上",
] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number];

export type ListingStatus = "上場" | "非上場" | "不明";

export type Company = {
  id: string;
  user_id: string;
  official_name: string;
  name_aliases: string[];
  industry: string | null;
  company_size: string | null;
  established_year: string | null;
  capital: string | null;
  headquarters: string | null;
  business_description: string | null;
  listing_status: ListingStatus | null;
  analysis_data: { notes?: string; [key: string]: unknown } | null;
  financial_data: Record<string, unknown> | null;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
  contacts?: Contact[];
  contact_count?: number;
};

export type Contact = {
  id: string;
  company_id: string;
  user_id: string;
  name: string;
  department: string | null;
  position: string | null;
  role: ContactRole | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  info_source: "公開情報" | "手動入力";
  created_at: string;
};

export interface Department {
  id: string;
  company_id: string;
  user_id?: string;
  name: string;
  parent_id: string | null;
  head_count: number;
  location: string;
  role: string;
  pain_points: string[];
  children: string[]; // computed from parent_id, not stored in DB
}

// ステータスのスタイルマップ
export const STATUS_STYLE: Record<CompanyStatus, string> = {
  未接触: "bg-[#E5E1D7] text-[#4A5A6E]",
  アプローチ中: "bg-blue-100 text-blue-700",
  商談中: "bg-[#1F8A5B]/10 text-[#1F8A5B]",
  契約済み: "bg-purple-100 text-purple-700",
  失注: "bg-[#D9534F]/10 text-[#D9534F]",
  アプローチ停止: "bg-orange-100 text-orange-700",
  時期を置いてアプローチ: "bg-[#FFE8A3]/80 text-amber-700",
};

// ロールのスタイルマップ
export const ROLE_STYLE: Record<ContactRole, string> = {
  決裁者: "bg-[#D9534F]/10 text-[#D9534F]",
  キーマン: "bg-orange-100 text-orange-700",
  推進者: "bg-[#1F8A5B]/10 text-[#1F8A5B]",
  反対者: "bg-[#E5E1D7] text-[#4A5A6E]",
  情報収集者: "bg-blue-100 text-blue-700",
};
