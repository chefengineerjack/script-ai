import OpenAI from "openai";
import type { GenerateRequest, GenerateResult, CompanyAnalysis } from "@/app/types/generate";
import { getUserFromRequest, signToken, setAuthCookie } from "@/app/lib/auth";
import { getUserByEmail } from "@/app/lib/user";
import {
  checkAndConsumeGuest,
  checkAndConsumeFreeUser,
  checkAndConsumeStandardUser,
} from "@/app/lib/rateLimit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PURPOSE_LABELS: Record<string, string> = {
  appointment: "アポイント獲得",
  hearing: "ヒアリング",
  proposal: "サービス提案",
  closing: "クロージング",
};

async function searchProductInfo(product: string): Promise<string> {
  const response = await client.responses.create({
    model: "gpt-4o",
    tools: [{ type: "web_search_preview" }],
    input: `「${product}」という商材・サービスについて以下の観点で日本語で調査してください：
1. 主な特徴と強み
2. 競合サービスとの差別化ポイント
3. 主なターゲット層・課題感
4. 導入メリットと実績・数字があれば

簡潔にまとめてください。`,
  });
  return response.output_text;
}

async function searchCompanyInfo(companyName: string, department: string): Promise<CompanyAnalysis> {
  const searchResponse = await client.responses.create({
    model: "gpt-4o",
    tools: [{ type: "web_search_preview" }],
    input: `「${companyName}」について以下の情報を日本語で調査してください：
1. 経営ビジョン・企業理念
2. 中期経営計画の重点施策
3. 直近のニュース・トピックス
4. ${department}が担うであろう事業課題

簡潔にまとめてください。`,
  });
  const rawInfo = searchResponse.output_text;

  const structuredResponse = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert business analyst. Always respond in valid JSON only. No markdown, no code fences, no explanations.",
      },
      {
        role: "user",
        content: `以下の企業調査情報をもとに、営業アプローチに役立つ企業分析をJSON形式で出力してください。

調査情報：
${rawInfo}

出力JSON：
{
  "companyAnalysis": {
    "companyName": "企業名（正式名称）",
    "vision": "経営ビジョン・企業理念（80字以内）",
    "midTermPlan": "中期経営計画の重点施策（100字以内）",
    "departmentRelevance": "${department}との関連性・事業課題（100字以内）",
    "recentNews": "直近の重要なニュース・トピック（80字以内）",
    "estimatedChallenges": [
      { "challenge": "推定課題", "relevance": "高" }
    ],
    "approachAdvice": "この企業への営業アプローチのアドバイス（100字以内）"
  }
}

estimatedChallengesは3〜5個。relevanceは「高」か「中」のみ。
日本語で出力。JSON形式のみ。説明文や前置きは不要。`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const content = structuredResponse.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(content);
  return parsed.companyAnalysis as CompanyAnalysis;
}

async function callGpt(promptText: string): Promise<GenerateResult> {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert sales consultant. Always respond in valid JSON only. No markdown, no code fences, no explanations.",
      },
      { role: "user", content: promptText },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  const content = response.choices[0].message.content ?? "{}";
  return JSON.parse(content);
}

function buildPhonePrompt(req: GenerateRequest, webInfo: string | null, companyAnalysis: CompanyAnalysis | null): string {
  const purpose = PURPOSE_LABELS[req.purpose] ?? req.purpose;
  const dept = req.targetDepartment || "各部門";
  const webSection = webInfo
    ? `\n- 以下のWeb調査結果から商材の実際の特徴・強みを活用すること：\n${webInfo}`
    : "";
  const companyLine = req.targetCompany ? `- ターゲット企業名: ${req.targetCompany}\n` : "";
  const companyAnalysisSection = companyAnalysis
    ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━
ターゲット企業分析情報
━━━━━━━━━━━━━━━━━━━━━━━━━
以下の企業分析情報をスクリプト全体に反映し、この企業特有の課題・ビジョンに紐づけたトークを設計してください。
- 企業名: ${companyAnalysis.companyName}
- 経営ビジョン: ${companyAnalysis.vision}
- 中期経営計画: ${companyAnalysis.midTermPlan}
- ${dept}との関連性: ${companyAnalysis.departmentRelevance}
- 直近のニュース: ${companyAnalysis.recentNews}
- 推定課題: ${companyAnalysis.estimatedChallenges.map((c) => `${c.challenge}（${c.relevance}）`).join("、")}
- アプローチアドバイス: ${companyAnalysis.approachAdvice}\n`
    : "";

  return `あなたは${req.targetIndustry}業界の${dept}への法人営業で15年の実績を持つトップセールスコンサルタントです。
以下の5つの原則に基づき、実践的な電話営業スクリプトを生成してください。

━━━━━━━━━━━━━━━━━━━━━━━━━
原則1：目的を意識する
━━━━━━━━━━━━━━━━━━━━━━━━━
この電話の営業目的は「${purpose}」です。
すべてのトーク（挨拶・本題・質問・クロージング）は、この目的の達成に向かって設計してください。
目的ごとのゴール定義：
- アポイント獲得 → 具体的な日程を2択で提示し、対面/オンライン商談の約束を取る
- ヒアリング → 相手の現状課題を3つ以上引き出し、次回提案の材料を得る
- サービス提案 → 商材の価値を理解してもらい、資料送付または詳細説明の機会を得る
- クロージング → 意思決定の障壁を特定し、導入時期・条件の合意を取る

━━━━━━━━━━━━━━━━━━━━━━━━━
原則2：ペルソナを作成する
━━━━━━━━━━━━━━━━━━━━━━━━━
ターゲットのペルソナを以下の情報から具体的に想定し、その人物に響くトークを設計してください。
- 業種: ${req.targetIndustry}
- 部門: ${dept}
- 役職: ${req.position}
- この人物が${dept}で日常的に抱えている業務上の悩み・KPI・評価基準を想定すること
- ${dept}特有の社内用語・意思決定プロセスを意識すること

役職別の課題提示レベル：
- 経営者・役員 → 【概念的・経営視点の課題】を提示する。市場環境の変化、中長期の競争力、全社的な経営指標への影響、業界全体のトレンドに対する戦略的な問いかけ。具体的なオペレーションの話は避け、経営判断に資する大きな視座で語る
- 部長クラス → 【部門戦略レベルの課題】を提示する。${dept}全体の目標達成、リソース配分の最適化、他部門との連携課題、中期的な部門計画への影響。現場の細部には踏み込まず、部門マネジメントの視点で語る
- 課長・マネージャー → 【チーム運営レベルの課題】を提示する。チームの業務プロセス上のボトルネック、メンバーの工数・負荷の偏り、属人化リスク、具体的なKPIの未達要因。日常業務の改善につながる実践的な話をする
- 担当者 → 【日常業務レベルの課題】を提示する。毎日・毎週発生する具体的な作業の非効率、手作業によるミス、ツールの使いにくさ、残業の原因になっている具体的なタスク。「あ、それ自分のことだ」と感じるリアルな描写で語る

━━━━━━━━━━━━━━━━━━━━━━━━━
原則3：相手の状況や問題点を聞き出す
━━━━━━━━━━━━━━━━━━━━━━━━━
電話の中盤に「ヒアリングパート」を独立して設けてください。
一方的に商材を説明するのではなく、${dept}の現状を引き出す質問を投げることで、
相手自身に「自分には課題がある」と気づかせる構成にしてください。

ヒアリング質問の設計ルール：
- 状況質問（${dept}で今どういう体制・やり方で運用しているか）→ 問題質問（そのやり方で何に困っているか）→ 示唆質問（その問題を放置すると${dept}にどんな影響が出るか）→ 解決質問（もし解決したら${dept}の業務はどう変わるか）の順序で構成
- 各質問は相手が「はい/いいえ」ではなく具体的に答えたくなるオープンクエスチョンにする
- ${req.targetIndustry}業界の${dept}特有の課題を前提にした質問にすること

━━━━━━━━━━━━━━━━━━━━━━━━━
原則4：質問はフローチャート形式で作成する
━━━━━━━━━━━━━━━━━━━━━━━━━
電話の会話全体を分岐フローチャートとして構造化してください。
相手の返答が「ポジティブ（興味あり・話を聞きたい）」か「ネガティブ（断り・不要）」かで、
次に進むべきトークが分岐します。

分岐の設計ルール：
- 各ノードには「このステップで相手に言わせたい一言」を設定する
- ポジティブ反応 → 次のステップに進む
- ネガティブ反応 → 対応する切り返しノードに遷移し、切り返し成功なら本流に戻る
- 切り返しても響かない場合 → 丁寧に電話を終える「撤退ノード」に進む
- 最大3回切り返してダメなら撤退、を基本ルールとする

━━━━━━━━━━━━━━━━━━━━━━━━━
原則5：実際のデータをもとに説得する
━━━━━━━━━━━━━━━━━━━━━━━━━
トークの中に、${dept}の担当者が「なるほど」と思える具体的なデータ・事例を組み込んでください。

データ活用ルール：
- ${req.targetIndustry}業界の${dept}に関連する統計・市場データを引用する
- 同業種・同部門での導入事例を示唆する（「同じ業界の${dept}のお客様で…」）
- 数字は具体的に（「大幅に改善」ではなく「平均30%削減」のように）
- ただし架空の企業名は出さないこと。「同業のお客様」「同規模の企業様」と表現する${webSection}
${companyAnalysisSection}
━━━━━━━━━━━━━━━━━━━━━━━━━
前提条件
━━━━━━━━━━━━━━━━━━━━━━━━━
- 自社業種: ${req.ownIndustry}
- 商材・サービス名: ${req.product}
- ターゲット業種: ${req.targetIndustry}
${companyLine}- ターゲット部門: ${dept}
- ターゲット役職: ${req.position}
- 営業目的: ${purpose}

重要：${req.product}は商材・サービスの名前であり、自社の会社名ではない。冒頭の挨拶では${req.product}を会社名として名乗らないこと。

━━━━━━━━━━━━━━━━━━━━━━━━━
出力JSON
━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "phone": {
    "persona": {
      "description": "想定ペルソナの概要。${req.targetIndustry}業界・${dept}・${req.position}の人物像（80〜120字）",
      "painPoints": ["${dept}でこの人物が抱える業務課題を3つ。役職に応じた抽象度で記述"],
      "decisionCriteria": "この役職・この部門での意思決定基準（40字以内）"
    },
    "greeting": "受付突破トーク。必ず「お世話になっております。（会社名）の〇〇と申します。」の形式で始めること。（会社名）と〇〇はそのままプレースホルダーとして出力し、ユーザーが自分で置き換える想定。${req.product}を会社名として使わないこと。100〜150字。",
    "greetingNote": "ポイント（30字以内）",
    "hook": "最初の15秒で興味を引くフレーズ。${req.targetIndustry}業界の${dept}に刺さるデータを含める（50〜80字）",
    "hearing": {
      "situation": "状況質問：${dept}の現在の体制・運用方法を聞く質問",
      "problem": "問題質問：${dept}で困っていること・非効率なことを引き出す質問",
      "implication": "示唆質問：その問題が${dept}や会社全体にどう影響するか気づかせる質問",
      "needPayoff": "解決質問：もし解決したら${dept}の業務がどう改善するか想像させる質問",
      "note": "ヒアリングの注意点（40字以内）"
    },
    "mainTalk": "本題トーク（450〜550字）。①${req.targetIndustry}業界の${dept}が直面している業界特有の課題を描写（役職に応じた抽象度で）→ ②その課題が${dept}の業務に与えている具体的な影響 → ③${req.product}がその課題をどう解決するか、${dept}にとってのベネフィットとして説明 → ④同業種・同部門での導入効果を数字で示す → ⑤${dept}で導入した場合の具体的な活用シーンを描写",
    "mainTalkNote": "意識すべきこと（50字以内）",
    "dataPoint": "${req.targetIndustry}業界の${dept}に関連する具体的なデータ・数値",
    "closing": "クロージングトーク。営業目的「${purpose}」のゴールに直結させる（100〜150字）",
    "closingNote": "ポイント（30字以内）",
    "objections": [
      {
        "text": "断り文句（${req.targetIndustry}業界の${dept}・${req.position}から実際に出やすいもの）",
        "empathy": "共感フレーズ（20〜30字）",
        "question": "切り返しの質問（80〜120字）。${dept}の業務実態に踏み込んだオープンクエスチョン",
        "reproposal": "再提案（80〜120字）。${req.targetIndustry}業界・${dept}の具体的なデータや同業種の事例を含める",
        "shouldContinue": true,
        "continueReason": "判断理由（20字以内）",
        "frequency": 1
      }
    ],
    "flowChart": {
      "nodes": [
        { "id": "greeting", "label": "受付突破", "type": "talk", "goalResponse": "${dept}の担当者に取り次いでもらう", "nextOnPositive": "hook", "nextOnNegative": "obj_gatekeeper" },
        { "id": "hook", "label": "フック（興味づけ）", "type": "talk", "goalResponse": "「もう少し聞きたい」と思わせる", "nextOnPositive": "hearing", "nextOnNegative": "obj_busy" },
        { "id": "hearing", "label": "ヒアリング（課題の引き出し）", "type": "hearing", "goalResponse": "相手が${dept}の課題を言語化する", "nextOnPositive": "mainTalk", "nextOnNegative": "obj_no_problem" },
        { "id": "mainTalk", "label": "本題（解決策の提示）", "type": "talk", "goalResponse": "「うちの${dept}にも当てはまるかも」と感じる", "nextOnPositive": "closing", "nextOnNegative": "obj_not_convinced" },
        { "id": "closing", "label": "クロージング", "type": "closing", "goalResponse": "次のアクションに合意する", "nextOnPositive": "success", "nextOnNegative": "obj_timing" },
        { "id": "success", "label": "目的達成", "type": "end" },
        { "id": "end_polite", "label": "丁寧に終話（再アプローチの余地を残す）", "type": "end" }
      ],
      "objectionNodes": [
        { "id": "obj_gatekeeper", "trigger": "受付で断られた", "response": "切り返しトーク", "retryCount": 0, "maxRetry": 2, "nextOnSuccess": "hook", "nextOnFail": "end_polite" },
        { "id": "obj_busy", "trigger": "今忙しい", "response": "切り返しトーク", "retryCount": 0, "maxRetry": 1, "nextOnSuccess": "hearing", "nextOnFail": "end_polite" },
        { "id": "obj_no_problem", "trigger": "特に課題はない", "response": "切り返しトーク", "retryCount": 0, "maxRetry": 2, "nextOnSuccess": "mainTalk", "nextOnFail": "end_polite" },
        { "id": "obj_not_convinced", "trigger": "うちには合わなそう", "response": "切り返しトーク", "retryCount": 0, "maxRetry": 2, "nextOnSuccess": "closing", "nextOnFail": "end_polite" },
        { "id": "obj_timing", "trigger": "今はタイミングじゃない", "response": "切り返しトーク", "retryCount": 0, "maxRetry": 1, "nextOnSuccess": "success", "nextOnFail": "end_polite" }
      ]
    }
  }
}

断り文句は8パターン生成してください。
flowChartのobjectionNodesは断り文句に対応させ、トーク全体の分岐を網羅してください。
日本語で出力。JSON形式のみ。説明文や前置きは不要。`;
}

function buildEmailPrompt(req: GenerateRequest, webInfo: string | null, companyAnalysis: CompanyAnalysis | null): string {
  const purpose = PURPOSE_LABELS[req.purpose] ?? req.purpose;
  const dept = req.targetDepartment || "各部門";
  const webSection = webInfo
    ? `\n- 以下のWeb調査結果から商材の実際の特徴・強みを活用すること：\n${webInfo}`
    : "";
  const companyLine = req.targetCompany ? `- ターゲット企業名: ${req.targetCompany}\n` : "";
  const companyAnalysisSection = companyAnalysis
    ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━
ターゲット企業分析情報
━━━━━━━━━━━━━━━━━━━━━━━━━
以下の企業分析情報をメール文面全体に反映し、この企業特有の課題・ビジョンに紐づけた内容を設計してください。
- 企業名: ${companyAnalysis.companyName}
- 経営ビジョン: ${companyAnalysis.vision}
- 中期経営計画: ${companyAnalysis.midTermPlan}
- ${dept}との関連性: ${companyAnalysis.departmentRelevance}
- 直近のニュース: ${companyAnalysis.recentNews}
- 推定課題: ${companyAnalysis.estimatedChallenges.map((c) => `${c.challenge}（${c.relevance}）`).join("、")}
- アプローチアドバイス: ${companyAnalysis.approachAdvice}\n`
    : "";

  return `あなたは${req.targetIndustry}業界の${dept}向けBtoBメールマーケティングの専門家です。
以下の5つの原則に基づき、開封率とレスポンス率を最大化するメール文面を生成してください。

━━━━━━━━━━━━━━━━━━━━━━━━━
原則1：目的を意識する
━━━━━━━━━━━━━━━━━━━━━━━━━
この営業の目的は「${purpose}」です。
3通すべてのメールは、最終的にこの目的の達成へ向かうストーリーとして設計してください。
- 1通目: ${dept}が直面している課題への気づきを与え、${req.product}の具体的な活用シーンを描写して興味を引く
- 2通目: 同業種・同部門の事例とデータで解決の可能性を裏付ける
- 3通目: 切り口を変えて再アプローチし、行動を促す

━━━━━━━━━━━━━━━━━━━━━━━━━
原則2：ペルソナを作成する
━━━━━━━━━━━━━━━━━━━━━━━━━
ターゲット：${req.targetIndustry}業界・${dept}の${req.position}
この人物がメールを読む状況を具体的に想定すること。
- 経営者・役員 → 移動中にスマホで確認。結論先行、3行で要点が分かる構成。${dept}の経営的インパクトに言及
- 部長クラス → 朝のメールチェック時に確認。${dept}全体の課題とデータ重視、社内転送しやすい形
- 課長・マネージャー → 業務の合間に確認。${dept}の具体的なプロセス課題と解決策の対比
- 担当者 → タスクの切れ目に確認。${dept}での日常業務に直結する内容、行動ハードルを下げる

━━━━━━━━━━━━━━━━━━━━━━━━━
原則3：相手の状況や問題点を意識する
━━━━━━━━━━━━━━━━━━━━━━━━━
メールの書き出しは、${req.targetIndustry}業界の${dept}が実際に直面している課題描写から始めること。
自社の紹介や商材の説明から始めないこと。

${dept}でよくある課題を具体的に描写し、読み手が「自分の部門のことだ」と感じる内容にすること。
加えて、${req.product}をこの部門で活用する具体的なシーン（どの業務で、どう使い、何が変わるか）を描写し、
読み手が導入後のイメージを持てるようにすること。

━━━━━━━━━━━━━━━━━━━━━━━━━
原則4：質問でエンゲージメントを高める
━━━━━━━━━━━━━━━━━━━━━━━━━
メール本文に1つ、${dept}の担当者が思わず考えてしまう問いかけを含めること。
この問いかけが返信のきっかけになるよう設計すること。

━━━━━━━━━━━━━━━━━━━━━━━━━
原則5：実際のデータをもとに説得する
━━━━━━━━━━━━━━━━━━━━━━━━━
特に2通目のフォローアップメールでは、具体的な数値・事例を含めること。
- ${req.targetIndustry}業界の${dept}に関連する統計データ
- 同業種・同部門での導入効果（「同業界の${dept}のお客様で、導入後○ヶ月で△△が□%改善」）
- 改善前→改善後の対比を数字で示す
- ${dept}の日常業務における具体的な活用シーン（before/after）を含める${webSection}
${companyAnalysisSection}
━━━━━━━━━━━━━━━━━━━━━━━━━
前提条件
━━━━━━━━━━━━━━━━━━━━━━━━━
- 自社業種: ${req.ownIndustry}
- 商材・サービス名: ${req.product}
- ターゲット業種: ${req.targetIndustry}
${companyLine}- ターゲット部門: ${dept}
- ターゲット役職: ${req.position}
- 営業目的: ${purpose}

重要：${req.product}は商材・サービスの名前であり、自社の会社名ではない。メール本文で${req.product}を会社名として使わないこと。各メールの末尾には必ず「（会社名）（氏名）」の形式でプレースホルダーを使った署名を付けること。

━━━━━━━━━━━━━━━━━━━━━━━━━
件名ルール
━━━━━━━━━━━━━━━━━━━━━━━━━
- 20文字以内
- 具体的な数字または${req.targetIndustry}業界・${dept}のキーワードを含む
- 「ご案内」「ご提案」「お知らせ」などの営業感が強い語は使わない
- ${dept}の担当者が「自分の部門に関係ある」と感じる件名にする

━━━━━━━━━━━━━━━━━━━━━━━━━
出力JSON
━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "email": {
    "persona": {
      "description": "${req.targetIndustry}業界・${dept}・${req.position}の想定ペルソナ概要（80〜120字）",
      "readingContext": "このペルソナがメールを読む状況（40字以内）",
      "departmentChallenges": ["${dept}でよくある課題を3つ"]
    },
    "initial": {
      "subject": "件名（20文字以内）",
      "body": "本文（400〜500字）。①${req.targetIndustry}業界の${dept}が直面している具体的な課題を描写 → ②その課題が${dept}の業務に与えている影響 → ③${req.product}を${dept}で活用する具体的なシーン → ④${dept}の担当者が思わず考えてしまう問いかけ → ⑤軽いCTA → 末尾に「（会社名）（氏名）」の署名",
      "sendTiming": "推奨送信タイミング（例：火曜 10:00頃）",
      "note": "このメールのポイント（30字以内）",
      "goalAction": "読者に期待するアクション（20字以内）"
    },
    "followup": {
      "subject": "件名（20文字以内）",
      "body": "本文（400〜500字）。①1通目とは異なる角度から${dept}の課題に切り込む → ②同業種・同部門での具体的な導入事例とデータ → ③導入前後のbefore/afterを${dept}の日常業務レベルで描写 → ④具体的な数値による効果の裏付け → ⑤次のアクションの提案 → 末尾に「（会社名）（氏名）」の署名",
      "sendTiming": "推奨送信タイミング",
      "note": "このメールのポイント（30字以内）",
      "goalAction": "読者に期待するアクション（20字以内）"
    },
    "reapproach": {
      "subject": "件名（20文字以内）",
      "body": "本文（400〜500字）。①季節の変化・四半期の変わり目・業界ニュースなど${dept}に関連するフックで書き出す → ②${dept}の別の課題または同じ課題の別の側面を提示 → ③${req.product}のまだ伝えていない活用シーンや機能を紹介 → ④同部門の他社事例を別角度で紹介 → ⑤以前より少し踏み込んだCTA → 末尾に「（会社名）（氏名）」の署名",
      "sendTiming": "推奨送信タイミング",
      "note": "このメールのポイント（30字以内）",
      "goalAction": "読者に期待するアクション（20字以内）"
    },
    "sequence": "3通を通じたストーリーの解説。${dept}への訴求がどう深まっていくかを説明（100字以内）"
  }
}

日本語で出力。JSON形式のみ。説明文や前置きは不要。`;
}

export async function POST(request: Request) {
  try {
    // ── デモモード（ローカル開発・スクリーンショット用）────────
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

    // ── 認証・プラン判定（Redisから最新プランを取得）──────────
    const jwtUser = await getUserFromRequest(request);
    let effectivePlan: "standard" | "free" | "guest" = "guest";
    let userEmail: string | null = null;

    if (jwtUser) {
      const dbUser = await getUserByEmail(jwtUser.email);
      const freshPlan = dbUser?.plan ?? jwtUser.plan;
      effectivePlan = freshPlan;
      userEmail = jwtUser.email;
      // プランが変わっていたらJWTを再発行
      if (dbUser && dbUser.plan !== jwtUser.plan) {
        const token = await signToken({ email: dbUser.email, plan: dbUser.plan });
        await setAuthCookie(token);
      }
    }

    // デモモード時はスタンダードプランとして扱う
    if (isDemoMode) {
      effectivePlan = "standard";
    }

    const isFreePlan = effectivePlan === "guest" || effectivePlan === "free";

    // ── レート制限チェック（デモモード時はスキップ）────────────
    if (isDemoMode) {
      // スキップ
    } else if (effectivePlan === "standard") {
      const { allowed } = await checkAndConsumeStandardUser(userEmail!);
      if (!allowed) {
        return Response.json(
          {
            error:
              "今月の生成回数（30回）を使い切りました。来月1日にリセットされます。",
            limitReached: true,
            remaining: 0,
            plan: "standard",
          },
          { status: 429 }
        );
      }
    } else if (effectivePlan === "free") {
      const { allowed } = await checkAndConsumeFreeUser(userEmail!);
      if (!allowed) {
        return Response.json(
          {
            error:
              "本日の無料枠を使い切りました。スタンダードプラン（月額980円）なら月30回ご利用いただけます。",
            limitReached: true,
            remaining: 0,
            plan: "free",
          },
          { status: 429 }
        );
      }
    } else {
      // ゲスト
      const guestToken = request.headers.get("x-guest-token") ?? "unknown";
      const { allowed } = await checkAndConsumeGuest(guestToken);
      if (!allowed) {
        return Response.json(
          {
            error:
              "無料お試しの1回を使い切りました。続けて使うには無料アカウント登録が必要です。",
            limitReached: true,
            remaining: 0,
            plan: "guest",
          },
          { status: 429 }
        );
      }
    }

    const body: GenerateRequest = await request.json();
    const dept = body.targetDepartment || "各部門";

    // フリー・ゲストは企業分析をスキップ（APIコスト節約）
    const [webInfo, companyAnalysis] = await Promise.all([
      body.webSearch ? searchProductInfo(body.product) : Promise.resolve(null),
      !isFreePlan && body.targetCompany
        ? searchCompanyInfo(body.targetCompany, dept)
        : Promise.resolve(null),
    ]);

    let result: GenerateResult;

    if (body.scriptType === "call") {
      result = await callGpt(buildPhonePrompt(body, webInfo, companyAnalysis));
    } else if (body.scriptType === "email") {
      result = await callGpt(buildEmailPrompt(body, webInfo, companyAnalysis));
    } else {
      // "both" → 並列実行
      const [phoneResult, emailResult] = await Promise.all([
        callGpt(buildPhonePrompt(body, webInfo, companyAnalysis)),
        callGpt(buildEmailPrompt(body, webInfo, companyAnalysis)),
      ]);
      result = { ...phoneResult, ...emailResult };
    }

    if (companyAnalysis) {
      result.companyAnalysis = companyAnalysis;
    }

    // プラン制限情報をレスポンスに付加
    result.planRestrictions = {
      companyAnalysisLocked: isFreePlan && !!body.targetCompany,
      flowChartLocked: isFreePlan,
    };

    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "スクリプトの生成に失敗しました。しばらく経ってから再試行してください。" },
      { status: 500 }
    );
  }
}
