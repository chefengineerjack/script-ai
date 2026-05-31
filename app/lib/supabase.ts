import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// API Route から呼ぶサーバー専用クライアント（サービスキーで RLS をバイパス）
export function createServerClient() {
  return createClient(url, serviceKey ?? anon, {
    auth: { persistSession: false },
  });
}

// 企業名の表記ゆれを吸収して正規化する
export function normalizeCompanyName(name: string): string {
  return name
    .replace(/株式会社|有限会社|合同会社|合名会社|合資会社/g, "")
    .replace(/㈱|㈲/g, "")
    .replace(/[（(]株[)）]/g, "")
    .replace(/[（(]有[)）]/g, "")
    // 全角英数を半角に
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    )
    // 全角スペース・半角スペースを除去
    .replace(/[\s　]+/g, "")
    .toLowerCase();
}
