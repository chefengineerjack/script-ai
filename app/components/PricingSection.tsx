const FORM_URL = "https://forms.gle/xPoQcpJBbGiiFGY39";

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
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "フリー",
    price: "¥0",
    period: "",
    tagline: "まずは試してみたい方に",
    features: [
      { label: "1日3回まで生成", included: true },
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
    ctaHref: FORM_URL,
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
      className="h-4 w-4 shrink-0 text-indigo-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-gray-300"
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

  return (
    <div
      className={`relative flex flex-col rounded-2xl bg-white overflow-hidden transition-all ${
        isHighlight
          ? "border-2 border-indigo-500 shadow-2xl shadow-indigo-100 px-7 pt-12 pb-8 md:-my-5"
          : "border border-gray-200 shadow-sm px-6 pt-8 pb-7"
      }`}
    >
      {/* Coming Soon リボン */}
      {plan.comingSoon && (
        <div
          className="absolute top-5 right-[-26px] w-32 rotate-45 bg-gray-600 py-1 text-center text-[10px] font-bold tracking-wider text-white shadow"
        >
          Coming Soon
        </div>
      )}

      {/* おすすめバッジ */}
      {plan.badge && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white shadow-md">
            ✨ {plan.badge}
          </span>
        </div>
      )}

      {/* プラン名・価格 */}
      <div className="mb-6 space-y-1">
        <h3
          className={`font-bold ${
            isHighlight ? "text-xl text-indigo-700" : "text-lg text-gray-800"
          }`}
        >
          {plan.name}
        </h3>
        <div className="flex items-end gap-1">
          <span
            className={`font-extrabold tracking-tight ${
              isHighlight ? "text-4xl text-gray-900" : "text-3xl text-gray-800"
            }`}
          >
            {plan.price}
          </span>
          {plan.period && (
            <span className="mb-1 text-sm text-gray-400">{plan.period}</span>
          )}
        </div>
        <p className="text-xs text-gray-500">{plan.tagline}</p>
      </div>

      {/* 機能リスト */}
      <ul className="mb-7 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li
            key={f.label}
            className={`flex items-center gap-2.5 text-sm ${
              f.included ? "text-gray-700" : "text-gray-300"
            }`}
          >
            {f.included ? <CheckIcon /> : <CrossIcon />}
            {f.label}
          </li>
        ))}
      </ul>

      {/* CTAボタン */}
      {plan.ctaHref ? (
        <a
          href={plan.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition-colors"
        >
          {plan.ctaLabel}
        </a>
      ) : plan.comingSoon ? (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-400"
        >
          {plan.ctaLabel}
        </button>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 py-3 text-center text-sm font-medium text-gray-400">
          {plan.ctaLabel}
        </div>
      )}
    </div>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-14 py-20 px-6">
      <div className="mx-auto max-w-5xl">
        {/* ヘッダー */}
        <div className="mb-14 text-center space-y-3">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            料金プラン
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            シンプルな料金体系
          </h2>
          <p className="text-gray-500">いつでもキャンセル可能。まずは無料でお試しください。</p>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
