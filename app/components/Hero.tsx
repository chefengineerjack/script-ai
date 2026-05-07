export default function Hero() {
  return (
    <section className="bg-[#F6F4EE] text-[#0F1B2D] px-6 pt-16 pb-20 md:px-16 md:pt-20 md:pb-28">
      <div className="mx-auto max-w-6xl">
        {/* 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-12 md:gap-16 items-start">

          {/* Left: copy + CTAs */}
          <div>
            {/* Chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0F1B2D] text-[#C8FF3E] text-[11px] font-bold rounded-full tracking-[0.8px] mb-6">
              ⚡ AI POWERED · 9業種に最適化
            </div>

            {/* H1 */}
            <h1
              className="font-[var(--font-sans)] font-black leading-[1.3] md:leading-[0.94] tracking-[-1.5px] md:tracking-[-3.5px] text-[40px] md:text-[64px] lg:text-[96px] mt-0 mb-0"
            >
              架電のたびに、<br />
              <span
                className="inline-block bg-[#C8FF3E] px-3 [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
                style={{ transform: "rotate(-1deg)" }}
              >
                勝率
              </span>を<br />
              上げていく。
            </h1>

            {/* Lead */}
            <p className="mt-8 text-[17px] leading-[1.7] text-[#4A5A6E] max-w-[520px]">
              業種・役職・商材を入れるだけで、AIが「響く言葉」を組み立てる。<br className="hidden sm:block" />
              ベテラン営業マンの脳内ロジックを、いつでも引き出せます。
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <a
                href="#form"
                className="inline-flex items-center justify-center gap-2 px-8 py-[18px] bg-[#0F1B2D] text-[#C8FF3E] font-bold text-base rounded-[14px] hover:opacity-90 transition-opacity"
              >
                無料で1本生成してみる →
              </a>
              <a
                href="#sample"
                className="inline-flex items-center justify-center px-7 py-[18px] border-[1.5px] border-[#0F1B2D] text-[#0F1B2D] font-semibold text-base rounded-[14px] bg-transparent hover:bg-[#0F1B2D]/5 transition-colors"
              >
                生成サンプルを見る
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex">
                {["#FFD8B0", "#FCEFB8", "#C8E8D6", "#D6D9F2"].map((bg, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#F6F4EE]"
                    style={{ background: bg, marginLeft: i ? "-10px" : "0" }}
                  />
                ))}
              </div>
              <p className="text-[13px] text-[#4A5A6E] leading-snug">
                <strong className="text-[#0F1B2D]">1,247人</strong>が今日も使っています
              </p>
            </div>
          </div>

          {/* Right: number cards */}
          <div className="flex flex-col gap-3">
            {/* 28秒 card */}
            <div className="relative bg-[#0F1B2D] text-[#F6F4EE] rounded-[24px] p-8 overflow-hidden">
              <p className="text-[11px] font-bold tracking-[1.5px] text-[#C8FF3E] mb-4">AVG. GENERATION TIME</p>
              <div className="font-[var(--font-display)] text-[100px] md:text-[110px] font-black tracking-[-5px] leading-[0.85]">
                28<span className="text-[32px] font-semibold">秒</span>
              </div>
              <p className="text-[13px] opacity-70 mt-3">架電1分前でも間に合うスピード</p>
              <div className="absolute right-[-30px] bottom-[-30px] w-40 h-40 rounded-full border border-white/10" />
            </div>

            {/* 9業種 + ¥0 row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#C8FF3E] text-[#0F1B2D] rounded-[24px] p-6">
                <p className="text-[11px] font-bold tracking-[1px] mb-3">業種テンプレ</p>
                <div className="font-[var(--font-display)] text-[52px] font-black tracking-[-2px] leading-[0.9]">
                  9<span className="text-[22px]">業種</span>
                </div>
                <p className="text-[12px] mt-2 opacity-70">×役職別チューニング</p>
              </div>
              <div className="bg-[#F6F4EE] text-[#0F1B2D] rounded-[24px] p-6 border-[1.5px] border-[#E5E1D7]">
                <p className="text-[11px] font-bold tracking-[1px] mb-3">初期費用</p>
                <div className="font-[var(--font-display)] text-[52px] font-black tracking-[-2px] leading-[0.9]">¥0</div>
                <p className="text-[12px] mt-2 text-[#4A5A6E]">クレカ登録なしで即試用</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
