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
} from "@/app/types/generate";

// ─── 共通パーツ ────────────────────────────────────────────

function Stars({ count }: { count: 1 | 2 | 3 }) {
  return (
    <span className="text-amber-400 text-sm leading-none">
      {"★".repeat(count)}
      <span className="text-gray-200">{"★".repeat(3 - count)}</span>
    </span>
  );
}

function NoteBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs text-indigo-700 shrink-0">
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
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
  return <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-500">{label}</h4>;
}

function TalkBox({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-800 leading-relaxed">
      {text}
    </p>
  );
}

// ─── ペルソナカード（電話用）────────────────────────────────

function PhonePersonaCard({ persona }: { persona: PhonePersona }) {
  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 space-y-3">
      <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">想定ペルソナ</p>
      <p className="text-sm text-gray-800 leading-relaxed">{persona.description}</p>
      <ul className="space-y-1">
        {persona.painPoints.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
            {p}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-gray-400">意思決定基準</span>
        <span className="text-xs font-medium text-violet-700 bg-violet-100 rounded-full px-2.5 py-0.5">
          {persona.decisionCriteria}
        </span>
      </div>
    </div>
  );
}

// ─── ペルソナカード（メール用）──────────────────────────────

function EmailPersonaCard({ persona }: { persona: EmailPersona }) {
  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 space-y-3">
      <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">想定ペルソナ</p>
      <p className="text-sm text-gray-800 leading-relaxed">{persona.description}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">読む状況</span>
        <span className="text-xs font-medium text-violet-700 bg-violet-100 rounded-full px-2.5 py-0.5">
          {persona.readingContext}
        </span>
      </div>
      <ul className="space-y-1">
        {persona.departmentChallenges.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
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
  green: "bg-green-50 border-green-200 text-green-700",
};

function HearingSection({ hearing }: { hearing: Hearing }) {
  return (
    <div className="space-y-3">
      {HEARING_STEPS.map(({ key, label, color }, i) => (
        <div key={key} className="flex gap-3 items-start">
          <span className={`shrink-0 mt-0.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${HEARING_COLOR[color]}`}>
            {i + 1}. {label}
          </span>
          <p className="text-sm text-gray-700 leading-relaxed">{hearing[key]}</p>
        </div>
      ))}
      <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
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
              <div className="h-7 w-7 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center z-10">
                {i + 1}
              </div>
              {!isLast && <div className="w-px flex-1 bg-indigo-200 my-1" />}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{NODE_TYPE_ICON[node.type]}</span>
                <p className="text-sm font-medium text-gray-800">{node.label}</p>
              </div>
              {node.goalResponse && (
                <p className="text-xs text-gray-400 mt-0.5 ml-5">目標：{node.goalResponse}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {node.nextOnPositive && (
                  <span className="text-xs rounded-full bg-green-50 border border-green-200 text-green-700 px-2 py-0.5">
                    ✓ 次へ進む
                  </span>
                )}
                {objNode && (
                  <span className="text-xs rounded-full bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5">
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
    <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-xs font-bold text-gray-400">#{index + 1}</span>
          <p className="text-sm font-medium text-gray-800 truncate">「{obj.text}」</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Stars count={obj.frequency} />
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700">① 共感</span>
              <p className="text-sm text-gray-700">{obj.empathy}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-xs font-semibold text-violet-700">② 質問</span>
              <p className="text-sm text-gray-700 leading-relaxed">{obj.question}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">③ 再提案</span>
              <p className="text-sm text-gray-700 leading-relaxed">{obj.reproposal}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
            obj.shouldContinue
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}>
            <span>{obj.shouldContinue ? "🔥 粘る" : "🤝 引く"}</span>
            <span className="text-gray-400">—</span>
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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 bg-gradient-to-r from-sky-50 to-indigo-50 px-6 py-4 flex items-center gap-3">
        <span className="text-xl">🏢</span>
        <div>
          <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">企業分析</p>
          <h3 className="text-lg font-bold text-gray-900">{analysis.companyName}</h3>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">経営ビジョン</p>
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.vision}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">中期経営計画</p>
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.midTermPlan}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">部門との関連性</p>
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.departmentRelevance}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">直近のニュース</p>
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.recentNews}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">推定課題</p>
          <div className="flex flex-wrap gap-2">
            {analysis.estimatedChallenges.map((item, i) => (
              <span
                key={i}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                  item.relevance === "高"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${item.relevance === "高" ? "bg-red-400" : "bg-amber-400"}`} />
                {item.challenge}
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${item.relevance === "高" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  {item.relevance}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
          <p className="text-xs font-semibold text-indigo-600 mb-1">アプローチアドバイス</p>
          <p className="text-sm text-indigo-900 leading-relaxed">{analysis.approachAdvice}</p>
        </div>
      </div>
    </div>
  );
}

// ─── 電話スクリプト ────────────────────────────────────────

function PhoneScriptView({ script }: { script: PhoneScript }) {
  return (
    <div className="space-y-7">
      <PhonePersonaCard persona={script.persona} />

      <div className="space-y-3">
        <SectionLabel label="会話フロー概要" />
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-4">
          <FlowChartView chart={script.flowChart} />
        </div>
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
        <p className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900 font-medium leading-relaxed">
          {script.hook}
        </p>
        {script.dataPoint && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
            <span className="text-xs font-semibold text-blue-600 shrink-0 mt-0.5">📊 データ</span>
            <p className="text-xs text-blue-800">{script.dataPoint}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <SectionLabel label="🎯 ヒアリングパート" />
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-4">
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
          <span className="text-xs text-gray-400">{script.objections.length}パターン ▼クリックで展開</span>
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
    <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 h-5 w-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
            {step}
          </span>
          <span className="text-sm font-semibold text-gray-700 truncate">{label}</span>
        </div>
        <CopyButton text={fullText} />
      </div>
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-semibold text-gray-400">件名</span>
          <p className="text-sm font-semibold text-gray-800">{template.subject}</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gray-400">本文</span>
          <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{template.body}</p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-1">
            🕐 {template.sendTiming}
          </span>
          <span className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1">
            💡 {template.note}
          </span>
          <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-1">
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
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
        <p className="text-xs font-semibold text-indigo-600 mb-1">3通のストーリー</p>
        <p className="text-sm text-indigo-900 leading-relaxed">{script.sequence}</p>
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

  return (
    <div className="space-y-6">
      {result.companyAnalysis && (
        <CompanyAnalysisCard analysis={result.companyAnalysis} />
      )}

      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">生成されたスクリプト</h3>
        </div>

        {showTabs && (
          <div className="flex border-b border-gray-100">
            {(["phone", "email"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? "border-b-2 border-indigo-500 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "phone" ? "📞 電話スクリプト" : "✉️ メール文面"}
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          {hasPhone && (!showTabs || tab === "phone") && result.phone && (
            <PhoneScriptView script={result.phone} />
          )}
          {hasEmail && (!showTabs || tab === "email") && result.email && (
            <EmailScriptView script={result.email} />
          )}
        </div>
      </div>
    </div>
  );
}
