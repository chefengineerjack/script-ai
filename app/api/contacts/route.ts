import { getUserFromRequest } from "@/app/lib/auth";
import { createServerClient } from "@/app/lib/supabase";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const body = await request.json();
  const { company_id, name, department, position, role, email, phone, notes, info_source } = body;

  if (!company_id || !name?.trim()) {
    return Response.json({ error: "企業IDと氏名は必須です" }, { status: 400 });
  }

  const db = createServerClient();

  // 企業の所有者確認
  const { data: company } = await db
    .from("companies")
    .select("id")
    .eq("id", company_id)
    .eq("user_id", user.email)
    .single();

  if (!company) {
    return Response.json({ error: "企業が見つかりません" }, { status: 404 });
  }

  const { data, error } = await db
    .from("contacts")
    .insert({
      company_id,
      user_id: user.email,
      name: name.trim(),
      department: department || null,
      position: position || null,
      role: role || null,
      email: email || null,
      phone: phone || null,
      notes: notes || null,
      info_source: info_source || "手動入力",
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ contact: data }, { status: 201 });
}
