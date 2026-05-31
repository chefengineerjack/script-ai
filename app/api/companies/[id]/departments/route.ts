import { getUserFromRequest } from "@/app/lib/auth";
import { createServerClient } from "@/app/lib/supabase";
import type { Department } from "@/app/types/crm";

type DeptRow = Omit<Department, "children">;

// 挿入順序が循環しないよう親→子の順にソート
function topologicalSort(depts: DeptRow[]): DeptRow[] {
  const result: DeptRow[] = [];
  const visited = new Set<string>();
  const map = new Map(depts.map((d) => [d.id, d]));

  function visit(d: DeptRow) {
    if (visited.has(d.id)) return;
    if (d.parent_id && map.has(d.parent_id)) visit(map.get(d.parent_id)!);
    visited.add(d.id);
    result.push(d);
  }

  depts.forEach(visit);
  return result;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const db = createServerClient();

  const { data, error } = await db
    .from("departments")
    .select("id, company_id, user_id, name, parent_id, head_count, location, role, pain_points, created_at")
    .eq("company_id", id)
    .eq("user_id", user.email)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ departments: data ?? [] });
}

// sync: 差分をまとめてINSERT/UPDATE/DELETE
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const departments: DeptRow[] = body.departments ?? [];
  const deletedIds: string[] = body.deletedIds ?? [];

  const db = createServerClient();

  // 削除（子孫は CASCADE か手動で処理）
  if (deletedIds.length > 0) {
    const { error } = await db
      .from("departments")
      .delete()
      .in("id", deletedIds)
      .eq("user_id", user.email);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  // 親→子の順にUPSERT
  if (departments.length > 0) {
    const sorted = topologicalSort(departments);
    for (const dept of sorted) {
      const { error } = await db.from("departments").upsert(
        {
          id: dept.id,
          company_id: id,
          user_id: user.email,
          name: dept.name,
          parent_id: dept.parent_id,
          head_count: dept.head_count || 0,
          location: dept.location || "",
          role: dept.role || "",
          pain_points: dept.pain_points || [],
        },
        { onConflict: "id" }
      );
      if (error) return Response.json({ error: error.message }, { status: 500 });
    }
  }

  return Response.json({ ok: true });
}
