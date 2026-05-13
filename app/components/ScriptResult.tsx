"use client";

import { useState } from "react";
import type {
  GenerateResult,
  PhoneScript,
  EmailScript,
  EmailTemplate,
  FlowChart,
  Objection,
  Hearing,
  PhonePersona,
  EmailPersona,
  CompanyAnalysis,
  PlanRestrictions,
} from "@/app/types/generate";

// ─── 共通パーツ ────────────────────────────────────────────

function Stars({ count }: { count: 1 | 2 | 3 }) {
  return (
    <span className="text-amber-400 text-sm leading-none">
      {"★".repeat(count)}
      <span className="text-[#E5E1D7]">{"★".repeat(3 - count)}</span>
    </span>
  );
}

function NoteBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#C8FF3E]/20 border border-[#C8FF3E]/40 px-2.5 py-0.5 text-xs text-[#0F1B2D] shrink-0">
      💡 {text}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-[10px] border border-[#E5E1D7] bg-white px-3 py-1.5 text-xs font-medium text-[#4A5A6E] hover:border-[#0F1B2D] hover:text-[#0F1B2D] transition-colors"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-[#1F8A5B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          コピー済み
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          コピー
        </>
      )}
    </button>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5A6E]">{label}</h4>;
}

function TalkBox({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap rounded-[14px] bg-[#F6F4EE] border border-[#E5E1D7] px-4 py-3 text-sm text-[#0F1B2D] leading-relaxed">
      {text}
    </p>
  );
}

// ─── ロックアイコン ────────────────────────────────────────

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

// ─── 企業分析（ロック済み） ────────────────────────────────

function CompanyAnalysisLocked() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[20px] border-2 border-[#0F1B2D] overflow-hidden shadow-[0_8px_32px_rgba(15,27,45,0.08)]">
      <div className="border-b border-[#E5E1D7] bg-[#F6F4EE] px-6 py-4 flex items-center gap-3">
        <span className="text-xl">🏢</span>
        <div>
          <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">企業分析</p>
          <h3 className="text-lg font-black text-[#0F1B2D]">ターゲット企業分析</h3>
        </div>
      </div>
      <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-full bg-[#E5E1D7] flex items-center justify-center">
          <LockIcon className="h-6 w-6 text-[#4A5A6E]" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-[#0F1B2D]">
            スタンダードプランで利用可能
          </p>
          <p className="text-xs text-[#4A5A6E] max-w-xs">
            経営ビジョン・推定課題・アプローチアドバイスなど、ターゲット企業の詳細分析はスタンダードプランでご利用いただけます。
          </p>
        </div>
        <a
          href="#pricing"
          className="rounded-[12px] bg-[#0F1B2D] px-5 py-2 text-sm font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity"
        >
          プランを見る
        </a>
      </div>
    </div>
  );
}

// ─── 会話フロー（ロック済み） ──────────────────────────────

function FlowChartLocked() {
  const fakeNodes = [
    { id: 1, label: "受付突破" },
    { id: 2, label: "フック（興味づけ）" },
    { id: 3, label: "ヒアリング（課題の引き出し）" },
    { id: 4, label: "本題（解決策の提示）" },
    { id: 5, label: "クロージング" },
  ];

  return (
    <div className="relative rounded-[14px] bg-[#F6F4EE] border border-[#E5E1D7] px-4 py-4 overflow-hidden min-h-[200px]">
      {/* ぼかしたダミーフロー */}
      <div className="blur-sm pointer-events-none select-none space-y-0">
        {fakeNodes.map((node, i) => (
          <div key={node.id} className="flex gap-3">
            <div className="flex flex-col items-center w-7 shrink-0">
              <div className="h-7 w-7 rounded-full bg-[#0F1B2D] text-[#C8FF3E] text-[11px] font-bold flex items-center justify-center">
                {i + 1}
              </div>
              {i < fakeNodes.length - 1 && (
                <div className="w-px bg-[#E5E1D7] my-1" style={{ height: "28px" }} />
              )}
            </div>
            <div className="flex-1 pb-3">
              <p className="text-sm font-medium text-[#0F1B2D]">{node.label}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-xs rounded-full bg-[#1F8A5B]/10 border border-[#1F8A5B]/30 text-[#1F8A5B] px-2 py-0.5">
                  ✓ 次へ進む
                </span>
                <span className="text-xs rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5">
                  ✗ 断り対応
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ロックオーバーレイ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-[2px]">
        <div className="h-11 w-11 rounded-full bg-white shadow-md border border-[#E5E1D7] flex items-center justify-center">
          <LockIcon className="h-5 w-5 text-[#0F1B2D]" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-[#0F1B2D]">
            会話フローはスタンダードプランで表示
          </p>
          <p className="text-xs text-[#4A5A6E]">
            分岐パターンと切り返しトークを含む完全版
          </p>
        </div>
        <a
          href="#pricing"
          className="rounded-[10px] bg-[#0F1B2D] px-4 py-1.5 text-xs font-bold text-[#C8FF3E] hover:opacity-90 transition-opacity"
        >
          プランを見る
        </a>
      </div>
    </div>
  );
}

// ─── ペルソナカード（電話用）────────────────────────────────

function PhonePersonaCard({ persona }: { persona: PhonePersona }) {
  return (
    <div className="rounded-[14px] border border-[#E5E1D7] bg-[#F6F4EE] p-4 space-y-3">
      <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">想定ペルソナ</p>
      <p className="text-sm text-[#0F1B2D] leading-relaxed">{persona.description}</p>
      <ul className="space-y-1">
        {persona.painPoints.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#0F1B2D]">
            <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-[#0F1B2D]" />
            {p}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-[#4A5A6E]">意思決定基準</span>
        <span className="text-xs font-medium text-[#0F1B2D] bg-[#C8FF3E] rounded-full px-2.5 py-0.5">
          {persona.decisionCriteria}
        </span>
      </div>
    </div>
  );
}

// ─── ペルソナカード（メール用）──────────────────────────────

function EmailPersonaCard({ persona }: { persona: EmailPersona }) {
  return (
    <div className="rounded-[14px] border border-[#E5E1D7] bg-[#F6F4EE] p-4 space-y-3">
      <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">想定ペルソナ</p>
      <p className="text-sm text-[#0F1B2D] leading-relaxed">{persona.description}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4A5A6E]">読む状況</span>
        <span className="text-xs font-medium text-[#0F1B2D] bg-[#C8FF3E] rounded-full px-2.5 py-0.5">
          {persona.readingContext}
        </span>
      </div>
      <ul className="space-y-1">
        {persona.departmentChallenges.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#0F1B2D]">
            <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-[#0F1B2D]" />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── ヒアリングパート ─────────────────────────────────────

const HEARING_STEPS = [
  { key: "situation" as const, label: "状況質問", color: "blue" },
  { key: "problem" as const, label: "問題質問", color: "orange" },
  { key: "implication" as const, label: "示唆質問", color: "red" },
  { key: "needPayoff" as const, label: "解決質問", color: "green" },
] as const;

const HEARING_COLOR: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  red: "bg-red-50 border-red-200 text-red-700",
  green: "bg-[#1F8A5B]/10 border-[#1F8A5B]/30 text-[#1F8A5B]",
};

function HearingSection({ hearing }: { hearing: Hearing }) {
  return (
    <div className="space-y-3">
      {HEARING_STEPS.map(({ key, label, color }, i) => (
        <div key={key} className="flex gap-3 items-start">
          <span className={`shrink-0 mt-0.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${HEARING_COLOR[color]}`}>
            {i + 1}. {label}
          </span>
          <p className="text-sm text-[#0F1B2D] leading-relaxed">{hearing[key]}</p>
        </div>
      ))}
      <div className="rounded-[10px] bg-[#FFE8A3]/40 border border-[#FFE8A3] px-3 py-2 text-xs text-[#0F1B2D]">
        ⚠️ {hearing.note}
      </div>
    </div>
  );
}

// ─── 会話フロー ────────────────────────────────────────────

const NODE_TYPE_ICON: Record<string, string> = {
  talk: "💬",
  hearing: "🎯",
  closing: "🤝",
  end: "✅",
};

function FlowChartView({ chart }: { chart: FlowChart }) {
  const objMap = Object.fromEntries(chart.objectionNodes.map((n) => [n.id, n]));
  const mainNodes = chart.nodes.filter((n) => n.type !== "end");

  return (
    <div className="space-y-0">
      {mainNodes.map((node, i) => {
        const objNode = node.nextOnNegative ? objMap[node.nextOnNegative] : undefined;
        const isLast = i === mainNodes.length - 1;
        return (
          <div key={node.id} className="flex gap-3">
            <div className="flex flex-col items-center w-7 shrink-0">
              <div className="h-7 w-7 rounded-full bg-[#0F1B2D] text-[#C8FF3E] text-[11px] font-bold flex items-center justify-center z-10">
                {i + 1}
              </div>
              {!isLast && <div className="w-px flex-1 bg-[#E5E1D7] my-1" />}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{NODE_TYPE_ICON[node.type]}</span>
                <p className="text-sm font-medium text-[#0F1B2D]">{node.label}</p>
              </div>
              {node.goalResponse && (
                <p className="text-xs text-[#4A5A6E] mt-0.5 ml-5">目標：{node.goalResponse}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {node.nextOnPositive && (
                  <span className="text-xs rounded-full bg-[#1F8A5B]/10 border border-[#1F8A5B]/30 text-[#1F8A5B] px-2 py-0.5">
                    ✓ 次へ進む
                  </span>
                )}
                {objNode && (
                  <span className="text-xs rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5">
                    ✗ {objNode.trigger}（最大{objNode.maxRetry}回切り返し）
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 断り文句カード（アコーディオン）──────────────────────

function ObjectionCard({ obj, index }: { obj: Objection; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[14px] border border-[#E5E1D7] bg-[#F6F4EE] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-[#E5E1D7]/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-xs font-bold text-[#4A5A6E]">#{index + 1}</span>
          <p className="text-sm font-medium text-[#0F1B2D] truncate">「{obj.text}」</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Stars count={obj.frequency} />
          <svg
            className={`h-4 w-4 text-[#4A5A6E] transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#E5E1D7] px-4 py-4 space-y-3 bg-white">
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700">① 共感</span>
              <p className="text-sm text-[#0F1B2D]">{obj.empathy}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 rounded border border-[#E5E1D7] bg-[#F6F4EE] px-1.5 py-0.5 text-xs font-semibold text-[#4A5A6E]">② 質問</span>
              <p className="text-sm text-[#0F1B2D] leading-relaxed">{obj.question}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 rounded border border-[#C8FF3E]/50 bg-[#C8FF3E]/20 px-1.5 py-0.5 text-xs font-semibold text-[#0F1B2D]">③ 再提案</span>
              <p className="text-sm text-[#0F1B2D] leading-relaxed">{obj.reproposal}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-medium ${
            obj.shouldContinue
              ? "bg-[#1F8A5B]/10 border border-[#1F8A5B]/30 text-[#1F8A5B]"
              : "bg-[#D9534F]/10 border border-[#D9534F]/30 text-[#D9534F]"
          }`}>
            <span>{obj.shouldContinue ? "🔥 粘る" : "🤝 引く"}</span>
            <span className="text-[#4A5A6E]">—</span>
            <span>{obj.continueReason}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 企業分析カード ────────────────────────────────────────

function CompanyAnalysisCard({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[20px] border-2 border-[#0F1B2D] overflow-hidden shadow-[0_8px_32px_rgba(15,27,45,0.08)]">
      <div className="border-b border-[#E5E1D7] bg-[#F6F4EE] px-6 py-4 flex items-center gap-3">
        <span className="text-xl">🏢</span>
        <div>
          <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">企業分析</p>
          <h3 className="text-lg font-black text-[#0F1B2D]">{analysis.companyName}</h3>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">経営ビジョン</p>
            <p className="text-sm text-[#0F1B2D] leading-relaxed">{analysis.vision}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">中期経営計画</p>
            <p className="text-sm text-[#0F1B2D] leading-relaxed">{analysis.midTermPlan}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">部門との関連性</p>
            <p className="text-sm text-[#0F1B2D] leading-relaxed">{analysis.departmentRelevance}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">直近のニュース</p>
            <p className="text-sm text-[#0F1B2D] leading-relaxed">{analysis.recentNews}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">推定課題</p>
          <div className="flex flex-wrap gap-2">
            {analysis.estimatedChallenges.map((item, i) => (
              <span
                key={i}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                  item.relevance === "高"
                    ? "bg-[#D9534F]/10 border-[#D9534F]/30 text-[#D9534F]"
                    : "bg-[#FFE8A3]/40 border-[#FFE8A3] text-amber-700"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${item.relevance === "高" ? "bg-[#D9534F]" : "bg-amber-400"}`} />
                {item.challenge}
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${item.relevance === "高" ? "bg-[#D9534F]/20 text-[#D9534F]" : "bg-[#FFE8A3] text-amber-700"}`}>
                  {item.relevance}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[14px] bg-[#C8FF3E]/20 border border-[#C8FF3E]/40 px-4 py-3">
          <p className="text-xs font-bold text-[#0F1B2D] mb-1">アプローチアドバイス</p>
          <p className="text-sm text-[#0F1B2D] leading-relaxed">{analysis.approachAdvice}</p>
        </div>

        {/* 財務情報セクション */}
        {analysis.financialInfo ? (
          analysis.financialInfo.dataAvailable ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#4A5A6E] uppercase tracking-wider">財務情報</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { label: "売上高", value: analysis.financialInfo.revenue },
                    { label: "前年比", value: analysis.financialInfo.revenueGrowth },
                    { label: "営業利益", value: analysis.financialInfo.operatingProfit },
                    { label: "営業利益率", value: analysis.financialInfo.operatingMargin },
                  ] as const
                ).map(({ label, value }) =>
                  value ? (
                    <div key={label} className="rounded-[10px] bg-[#F6F4EE] border border-[#E5E1D7] px-3 py-2 text-center">
                      <p className="text-[10px] text-[#4A5A6E] font-semibold">{label}</p>
                      <p className="text-sm font-bold text-[#0F1B2D] mt-0.5 break-all">{value}</p>
                    </div>
                  ) : null
                )}
              </div>
              {analysis.financialInfo.keyInvestments.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-[#4A5A6E]">重点投資:</span>
                  {analysis.financialInfo.keyInvestments.map((inv, i) => (
                    <span key={i} className="rounded-full bg-[#C8FF3E] px-2.5 py-0.5 text-xs font-semibold text-[#0F1B2D]">
                      {inv}
                    </span>
                  ))}
                </div>
              )}
              {analysis.financialInfo.financialTrend && (
                <p className="text-xs text-[#4A5A6E] leading-relaxed">{analysis.financialInfo.financialTrend}</p>
              )}
              {analysis.financialInfo.salesOpportunity && (
                <div className="rounded-[10px] bg-blue-50 border border-blue-100 px-3 py-2.5">
                  <p className="text-xs font-bold text-blue-700 mb-0.5">📈 営業アプローチヒント</p>
                  <p className="text-xs text-blue-800 leading-relaxed">{analysis.financialInfo.salesOpportunity}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[10px] bg-[#E5E1D7]/40 border border-[#E5E1D7] px-3 py-2.5 flex items-center gap-2">
              <span className="text-sm">📋</span>
              <p className="text-xs text-[#4A5A6E]">財務情報は公開されていません（非上場企業または情報未取得）</p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

// ─── 電話スクリプト ────────────────────────────────────────

function PhoneScriptView({ script, restrictions }: { script: PhoneScript; restrictions?: PlanRestrictions }) {
  return (
    <div className="space-y-7">
      <PhonePersonaCard persona={script.persona} />

      <div className="space-y-3">
        <SectionLabel label="会話フロー概要" />
        {restrictions?.flowChartLocked ? (
          <FlowChartLocked />
        ) : (
          <div className="rounded-[14px] bg-[#F6F4EE] border border-[#E5E1D7] px-4 py-4">
            <FlowChartView chart={script.flowChart} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <SectionLabel label="① 冒頭の挨拶トーク（受付突破用）" />
          <NoteBadge text={script.greetingNote} />
        </div>
        <TalkBox text={script.greeting} />
      </div>

      <div className="space-y-2">
        <SectionLabel label="💡 フック（最初の15秒）" />
        <p className="rounded-[14px] bg-[#FFE8A3]/40 border border-[#FFE8A3] px-4 py-3 text-sm text-[#0F1B2D] font-medium leading-relaxed">
          {script.hook}
        </p>
        {script.dataPoint && (
          <div className="flex items-start gap-2 rounded-[10px] bg-blue-50 border border-blue-100 px-3 py-2">
            <span className="text-xs font-semibold text-blue-600 shrink-0 mt-0.5">📊 データ</span>
            <p className="text-xs text-blue-800">{script.dataPoint}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <SectionLabel label="🎯 ヒアリングパート" />
        <div className="rounded-[14px] bg-[#F6F4EE] border border-[#E5E1D7] px-4 py-4">
          <HearingSection hearing={script.hearing} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <SectionLabel label="② 本題トーク" />
          <NoteBadge text={script.mainTalkNote} />
        </div>
        <TalkBox text={script.mainTalk} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <SectionLabel label="③ クロージングトーク" />
          <NoteBadge text={script.closingNote} />
        </div>
        <TalkBox text={script.closing} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel label="④ 断り文句と切り返し" />
          <span className="text-xs text-[#4A5A6E]">{script.objections.length}パターン ▼クリックで展開</span>
        </div>
        <div className="space-y-2">
          {script.objections.map((obj, i) => (
            <ObjectionCard key={i} obj={obj} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── メール文面 ───────────────────────────────────────────

function EmailCard({ label, template, step }: { label: string; template: EmailTemplate; step: number }) {
  const fullText = `件名：${template.subject}\n\n${template.body}`;
  return (
    <div className="rounded-[14px] border border-[#E5E1D7] bg-[#F6F4EE] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#E5E1D7] bg-white px-4 py-3 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 h-5 w-5 rounded-full bg-[#0F1B2D] text-[#C8FF3E] text-[11px] font-bold flex items-center justify-center">
            {step}
          </span>
          <span className="text-sm font-semibold text-[#0F1B2D] truncate">{label}</span>
        </div>
        <CopyButton text={fullText} />
      </div>
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-semibold text-[#4A5A6E]">件名</span>
          <p className="text-sm font-semibold text-[#0F1B2D]">{template.subject}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#4A5A6E]">本文</span>
          <p className="whitespace-pre-wrap text-sm text-[#0F1B2D] leading-relaxed">{template.body}</p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#E5E1D7]">
          <span className="flex items-center gap-1 text-xs text-[#4A5A6E] bg-white border border-[#E5E1D7] rounded-full px-2.5 py-1">
            🕐 {template.sendTiming}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#0F1B2D] bg-[#C8FF3E]/20 border border-[#C8FF3E]/40 rounded-full px-2.5 py-1">
            💡 {template.note}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#1F8A5B] bg-[#1F8A5B]/10 border border-[#1F8A5B]/30 rounded-full px-2.5 py-1">
            🎯 {template.goalAction}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmailScriptView({ script }: { script: EmailScript }) {
  return (
    <div className="space-y-5">
      <EmailPersonaCard persona={script.persona} />
      <div className="rounded-[14px] bg-[#C8FF3E]/20 border border-[#C8FF3E]/40 px-4 py-3">
        <p className="text-xs font-bold text-[#0F1B2D] mb-1">3通のストーリー</p>
        <p className="text-sm text-[#0F1B2D] leading-relaxed">{script.sequence}</p>
      </div>
      <EmailCard label="初回コンタクトメール" template={script.initial} step={1} />
      <EmailCard label="フォローアップメール（3日後）" template={script.followup} step={2} />
      <EmailCard label="再アプローチメール（1ヶ月後）" template={script.reapproach} step={3} />
    </div>
  );
}

// ─── メインコンポーネント ──────────────────────────────────

export default function ScriptResult({ result }: { result: GenerateResult }) {
  const hasPhone = !!result.phone;
  const hasEmail = !!result.email;
  const [tab, setTab] = useState<"phone" | "email">(hasPhone ? "phone" : "email");
  const showTabs = hasPhone && hasEmail;
  const restrictions = result.planRestrictions;

  return (
    <div className="space-y-6">
      {/* 企業分析：ロック or 通常表示 */}
      {restrictions?.companyAnalysisLocked ? (
        <CompanyAnalysisLocked />
      ) : result.companyAnalysis ? (
        <CompanyAnalysisCard analysis={result.companyAnalysis} />
      ) : null}

      <div className="w-full max-w-2xl mx-auto bg-white rounded-[20px] border-2 border-[#0F1B2D] overflow-hidden shadow-[0_8px_32px_rgba(15,27,45,0.08)]">
        <div className="border-b border-[#E5E1D7] bg-[#F6F4EE] px-6 py-4">
          <h3 className="text-lg font-black text-[#0F1B2D]">生成されたスクリプト</h3>
        </div>

        {showTabs && (
          <div className="flex border-b border-[#E5E1D7]">
            {(["phone", "email"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? "border-b-2 border-[#0F1B2D] text-[#0F1B2D] bg-[#F6F4EE]"
                    : "text-[#4A5A6E] hover:text-[#0F1B2D]"
                }`}
              >
                {t === "phone" ? "📞 電話スクリプト" : "✉️ メール文面"}
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          {hasPhone && (!showTabs || tab === "phone") && result.phone && (
            <PhoneScriptView script={result.phone} restrictions={restrictions} />
          )}
          {hasEmail && (!showTabs || tab === "email") && result.email && (
            <EmailScriptView script={result.email} />
          )}
        </div>
      </div>
    </div>
  );
}
