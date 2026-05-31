import { getUserFromRequest } from "@/app/lib/auth";
import { createServerClient, normalizeCompanyName } from "@/app/lib/supabase";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ duplicate: null });

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const excludeId = searchParams.get("excludeId");
  if (!name?.trim()) return Response.json({ duplicate: null });

  const normalized = normalizeCompanyName(name.trim());
  if (!normalized) return Response.json({ duplicate: null });

  const db = createServerClient();
  let query = db
    .from("companies")
    .select("id, official_name, status, name_aliases")
    .eq("user_id", user.email);

  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query;
  if (!data) return Response.json({ duplicate: null });

  const match = data.find((c: Record<string, unknown>) => {
    const aliases: string[] = (c.name_aliases as string[]) ?? [];
    return (
      normalizeCompanyName(c.official_name as string) === normalized ||
      aliases.some((a: string) => normalizeCompanyName(a) === normalized)
    );
  });

  return Response.json({ duplicate: match ?? null });
}
