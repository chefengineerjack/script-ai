import CheckoutButton from "@/app/components/CheckoutButton";

type Feature = { label: string; included: boolean };

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: Feature[];
  ctaLabel: string;
  ctaHref: string | null;
  highlight: boolean;
  comingSoon: boolean;
  badge: string | null;
  useCheckout?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "フリー",
    price: "¥0",
    period: "",
    tagline: "まずは試してみたい方に",
    features: [
      { label: "1日2回まで生成", included: true },
      { label: "電話スクリプト", included: true },
      { label: "メール営業文面", included: true },
      { label: "企業分析機能", included: false },
      { label: "分岐フローチャート", included: false },
    ],
    ctaLabel: "現在のプラン",
    ctaHref: null,
    highlight: false,
    comingSoon: false,
    badge: null,
  },
  {
    id: "standard",
    name: "スタンダード",
    price: "¥980",
    period: "/月",
    tagline: "日常的に営業活動する方に",
    features: [
      { label: "月30回まで生成", included: true },
      { label: "電話スクリプト", included: true },
      { label: "メール営業文面", included: true },
      { label: "企業分析機能", included: true },
      { label: "分岐フローチャート", included: true },
    ],
    ctaLabel: "月額980円で始める",
    ctaHref: null,
    useCheckout: true,
    highlight: true,
    comingSoon: false,
    badge: "おすすめ",
  },
  {
    id: "pro",
    name: "プロ",
    price: "¥2,980",
    period: "/月",
    tagline: "チームで本格活用したい方に",
    features: [
      { label: "無制限生成", included: true },
      { label: "電話スクリプト", included: true },
      { label: "メール営業文面", included: true },
      { label: "企業分析機能", included: true },
      { label: "分岐フローチャート", included: true },
      { label: "生成履歴の保存", included: true },
      { label: "スクリプトのPDF出力", included: true },
    ],
    ctaLabel: "準備中",
    ctaHref: null,
    highlight: false,
    comingSoon: true,
    badge: null,
  },
];

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-[#0F1B2D]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon({ highlight }: { highlight?: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${highlight ? "text-[#C8FF3E]/40" : "text-[#E5E1D7]"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const isHighlight = plan.highlight;
  const isDim = plan.comingSoon;

  return (
    <div
      className={`relative flex flex-col rounded-[20px] overflow-hidden transition-all ${
        isHighlight
          ? "bg-[#C8FF3E] text-[#0F1B2D] px-7 pt-12 pb-8 md:-my-5"
          : "bg-[#F6F4EE]/10 text-[#F6F4EE] border border-white/15 px-6 pt-8 pb-7"
      } ${isDim ? "opacity-55" : ""}`}
    >
      {/* Coming Soon リボン */}
      {plan.comingSoon && (
        <div className="absolute top-5 right-[-26px] w-32 rotate-45 bg-[#4A5A6E] py-1 text-center text-[10px] font-bold tracking-wider text-[#F6F4EE] shadow">
          Coming Soon
        </div>
      )}

      {/* おすすめバッジ */}
      {plan.badge && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-[#0F1B2D] px-4 py-1 text-xs font-bold text-[#C8FF3E] shadow-md">
            ★ {plan.badge}
          </span>
        </div>
      )}

      {/* プラン名 */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className={`text-[12px] font-bold tracking-[1px] ${isHighlight ? "text-[#0F1B2D]" : "text-[#F6F4EE]"}`}>
          {plan.name.toUpperCase()}
        </h3>
      </div>

      {/* 価格 */}
      <div className="mb-1">
        <span className={`font-[var(--font-display)] text-[52px] font-black tracking-[-2px] leading-[1] ${isHighlight ? "text-[#0F1B2D]" : "text-[#F6F4EE]"}`}>
          {plan.price}
        </span>
        {plan.period && (
          <span className={`text-[13px] ml-1 ${isHighlight ? "opacity-70" : "opacity-60"}`}>{plan.period}/月</span>
        )}
      </div>
      <p className={`text-[13px] mb-6 ${isHighlight ? "opacity-70" : "opacity-60"}`}>{plan.tagline}</p>

      {/* 区切り */}
      <div className={`h-px mb-6 ${isHighlight ? "bg-[#0F1B2D]/15" : "bg-white/15"}`} />

      {/* 機能リスト */}
      <ul className="mb-7 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li
            key={f.label}
            className={`flex items-center gap-2.5 text-[14px] ${
              f.included
                ? isHighlight ? "text-[#0F1B2D]" : "text-[#F6F4EE]"
                : isHighlight ? "text-[#0F1B2D]/40" : "text-[#F6F4EE]/30"
            }`}
          >
            {f.included ? <CheckIcon /> : <CrossIcon highlight={isHighlight} />}
            {f.label}
          </li>
        ))}
      </ul>

      {/* CTAボタン */}
      {plan.useCheckout ? (
        <CheckoutButton
          label={plan.ctaLabel}
          className={`block w-full rounded-full py-3.5 text-center text-sm font-bold transition-opacity disabled:opacity-70 disabled:cursor-not-allowed ${
            isHighlight
              ? "bg-[#0F1B2D] text-[#C8FF3E] hover:opacity-90"
              : "bg-transparent text-[#F6F4EE] border border-white/40 hover:bg-white/10"
          }`}
        />
      ) : plan.ctaHref ? (
        <a
          href={plan.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full rounded-full py-3.5 text-center text-sm font-bold transition-colors ${
            isHighlight
              ? "bg-[#0F1B2D] text-[#C8FF3E] hover:opacity-90"
              : "bg-transparent text-[#F6F4EE] border border-white/40 hover:bg-white/10"
          }`}
        >
          {plan.ctaLabel}
        </a>
      ) : plan.comingSoon ? (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-full bg-white/10 py-3.5 text-sm font-bold text-[#F6F4EE]/50"
        >
          {plan.ctaLabel}
        </button>
      ) : (
        <div className={`rounded-full py-3.5 text-center text-sm font-medium ${isHighlight ? "bg-[#0F1B2D]/10 text-[#0F1B2D]/50" : "border border-white/20 text-[#F6F4EE]/40"}`}>
          {plan.ctaLabel}
        </div>
      )}
    </div>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-14 bg-[#F6F4EE] px-6 pb-0 pt-0">
      <div className="bg-[#0F1B2D] mx-auto max-w-6xl rounded-[32px] px-8 py-16 md:px-14 md:py-20">
        {/* ヘッダー */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="text-[#F6F4EE] font-black text-[28px] md:text-[48px] tracking-[-1.5px] leading-[1]">
            まず<span className="text-[#C8FF3E]">無料</span>で。<br />
            気に入ったら月額¥980。
          </h2>
          <p className="text-[13px] text-[#F6F4EE]/50 max-w-[200px]">
            いつでもキャンセル可能。<br />クレジットカードは課金時のみ。
          </p>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
