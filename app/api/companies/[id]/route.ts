import { getUserFromRequest } from "@/app/lib/auth";
import { createServerClient } from "@/app/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const db = createServerClient();

  const { data: company, error } = await db
    .from("companies")
    .select("*, contacts(*)")
    .eq("id", id)
    .eq("user_id", user.email)
    .single();

  if (error || !company) {
    return Response.json({ error: "企業が見つかりません" }, { status: 404 });
  }

  return Response.json({ company });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { official_name, industry, company_size, status, notes } = body;

  const db = createServerClient();

  // 所有者確認
  const { data: existing } = await db
    .from("companies")
    .select("id, analysis_data")
    .eq("id", id)
    .eq("user_id", user.email)
    .single();

  if (!existing) {
    return Response.json({ error: "企業が見つかりません" }, { status: 404 });
  }

  const updatedAnalysis = {
    ...(existing.analysis_data ?? {}),
    ...(notes !== undefined ? { notes } : {}),
  };

  const { data, error } = await db
    .from("companies")
    .update({
      ...(official_name !== undefined && { official_name }),
      ...(industry !== undefined && { industry: industry || null }),
      ...(company_size !== undefined && { company_size: company_size || null }),
      ...(status !== undefined && { status }),
      analysis_data: updatedAnalysis,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.email)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ company: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const db = createServerClient();

  const { error } = await db
    .from("companies")
    .delete()
    .eq("id", id)
    .eq("user_id", user.email);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
