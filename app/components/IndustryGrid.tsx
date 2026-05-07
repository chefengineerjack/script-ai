const INDUSTRIES = [
  { emoji: "🏭", name: "製造業", desc: "生産・調達・コスト削減に特化" },
  { emoji: "💻", name: "IT・SaaS", desc: "DX推進・効率化提案に最適化" },
  { emoji: "🏢", name: "不動産", desc: "物件提案から成約まで対応" },
  { emoji: "🏦", name: "金融・保険", desc: "コンプライアンス対応のトーク" },
  { emoji: "👥", name: "人材・HR", desc: "採用・転職支援に特化した構成" },
  { emoji: "🏥", name: "医療・ヘルスケア", desc: "専門家向け丁寧なアプローチ" },
  { emoji: "🏗️", name: "建設・土木", desc: "現場ニーズに即した提案力" },
  { emoji: "📦", name: "卸売・流通", desc: "仕入れ・在庫最適化を訴求" },
  { emoji: "🍴", name: "飲食・小売", desc: "店舗拡大・集客支援向け" },
];

export default function IndustryGrid() {
  return (
    <section className="bg-[#F6F4EE] text-[#0F1B2D] px-6 py-20 md:px-16 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-[12px] font-bold tracking-[1.5px] text-[#4A5A6E] text-center mb-4">9 INDUSTRIES</p>
        <h2 className="font-black text-[28px] md:text-[48px] tracking-[-1.5px] leading-[1.1] text-center mb-14">
          9業種すべてに、本気で最適化。
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDUSTRIES.map((industry) => (
            <div
              key={industry.name}
              className="bg-white rounded-[16px] border border-[#E5E1D7] p-6 flex items-start gap-4 hover:border-[#0F1B2D] hover:shadow-[0_8px_32px_rgba(15,27,45,0.08)] transition-all"
            >
              <span className="text-3xl shrink-0">{industry.emoji}</span>
              <div>
                <p className="font-bold text-[15px] text-[#0F1B2D] mb-1">{industry.name}</p>
                <p className="text-[13px] text-[#4A5A6E] leading-[1.6]">{industry.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
