import { getUserFromRequest } from "@/app/lib/auth";
import { createServerClient, normalizeCompanyName } from "@/app/lib/supabase";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const db = createServerClient();
  let query = db
    .from("companies")
    .select("*, contacts(id)")
    .eq("user_id", user.email)
    .order("updated_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  type CompanyRow = Record<string, unknown> & { official_name: string; contact_count: number };
  let companies: CompanyRow[] = (data ?? []).map((c: Record<string, unknown>) => ({
    ...c,
    official_name: c.official_name as string,
    contact_count: Array.isArray(c.contacts) ? (c.contacts as unknown[]).length : 0,
    contacts: undefined,
  }));

  if (search) {
    const q = search.toLowerCase();
    companies = companies.filter((c) => c.official_name.toLowerCase().includes(q));
  }

  return Response.json({ companies });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const body = await request.json();
  const { official_name, industry, company_size, status, notes } = body;

  if (!official_name?.trim()) {
    return Response.json({ error: "企業名は必須です" }, { status: 400 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("companies")
    .insert({
      user_id: user.email,
      official_name: official_name.trim(),
      name_aliases: [normalizeCompanyName(official_name.trim())],
      industry: industry || null,
      company_size: company_size || null,
      status: status || "未接触",
      analysis_data: notes ? { notes } : null,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ company: data }, { status: 201 });
}
