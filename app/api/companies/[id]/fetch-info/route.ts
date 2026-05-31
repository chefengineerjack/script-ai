import OpenAI from "openai";
import { getUserFromRequest } from "@/app/lib/auth";
import { createServerClient } from "@/app/lib/supabase";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VALID_LISTING_STATUSES = ["上場", "非上場", "不明"] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const db = createServerClient();

  const { data: company } = await db
    .from("companies")
    .select("official_name")
    .eq("id", id)
    .eq("user_id", user.email)
    .single();

  if (!company) return Response.json({ error: "企業が見つかりません" }, { status: 404 });

  const name = company.official_name;

  const [res1, res2, res3] = await Promise.all([
    client.responses.create({
      model: "gpt-4o",
      tools: [{ type: "web_search_preview" }],
      input: `「${name}」の従業員数・設立年・資本金について日本語で調査してください。`,
    }),
    client.responses.create({
      model: "gpt-4o",
      tools: [{ type: "web_search_preview" }],
      input: `「${name}」の主な事業内容・業種について日本語で調査してください。`,
    }),
    client.responses.create({
      model: "gpt-4o",
      tools: [{ type: "web_search_preview" }],
      input: `「${name}」の本社所在地・上場・非上場の区分について日本語で調査してください。`,
    }),
  ]);

  const combined = [res1.output_text, res2.output_text, res3.output_text].join("\n\n---\n\n");

  const structured = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert business analyst. Always respond in valid JSON only. No markdown, no code fences, no explanations.",
      },
      {
        role: "user",
        content: `以下の調査結果から企業情報を抽出してJSON形式で返してください。

調査結果：
${combined}

以下のJSON形式で返してください。取得できない情報はnullにしてください：
{
  "industry": "業種（例：IT・Web、製造業、金融・保険、不動産、医療・ヘルスケアなど）",
  "established_year": "設立年（例：1990年）",
  "capital": "資本金（例：1億円、5000万円など）",
  "headquarters": "本社所在地（都道府県市区町村まで）",
  "business_description": "事業内容の概要（100字以内）",
  "listing_status": "「上場」「非上場」「不明」のいずれか"
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = JSON.parse(structured.choices[0].message.content ?? "{}");

  const info = {
    industry: raw.industry ?? null,
    established_year: raw.established_year ?? null,
    capital: raw.capital ?? null,
    headquarters: raw.headquarters ?? null,
    business_description: raw.business_description ?? null,
    listing_status: VALID_LISTING_STATUSES.includes(raw.listing_status)
      ? raw.listing_status
      : null,
  };

  return Response.json({ info });
}
