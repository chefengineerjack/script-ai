export default function SampleOutput() {
  return (
    <section id="sample" className="bg-[#0F1B2D] text-[#F6F4EE] px-6 py-20 md:px-16 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 md:gap-16 items-center">

          {/* Left: text */}
          <div>
            <p className="text-[12px] font-bold tracking-[1.5px] text-[#C8FF3E] mb-4">SAMPLE OUTPUT</p>
            <h2 className="font-black text-[28px] md:text-[48px] lg:text-[56px] tracking-[-1.5px] leading-[1.1] m-0">
              こういうトークが、<br />30秒後に手元に。
            </h2>
            <p className="text-[17px] opacity-70 leading-[1.7] mt-6 max-w-[480px]">
              実際の生成例。業種×役職×目的の組み合わせ別に、最適化されたフローと話法が出力されます。
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {["IT×製造業×経営者", "金融×医療×部長", "人材×不動産×担当"].map((tag, i) => (
                <span
                  key={tag}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold ${
                    i === 0
                      ? "bg-[#C8FF3E] text-[#0F1B2D]"
                      : "bg-transparent text-[#F6F4EE] border border-white/20"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: script card */}
          <div className="bg-[#F6F4EE] text-[#0F1B2D] rounded-[20px] p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D7] mb-4">
              <p className="text-[12px] font-bold text-[#4A5A6E] tracking-[0.5px]">📞 電話営業スクリプト</p>
              <p className="text-[11px] text-[#4A5A6E]">生成時刻 14:32</p>
            </div>
            <div className="text-[13px] leading-[1.8] text-[#0F1B2D]">
              <p className="text-[11px] font-bold tracking-[1px] text-[#0F1B2D]/50 mb-1.5">▸ 冒頭フック（10秒）</p>
              <p className="mb-4">「お忙しいところ恐れ入ります。製造業の在庫管理にお困りの企業様向けに——」</p>
              <p className="text-[11px] font-bold tracking-[1px] text-[#0F1B2D]/50 mb-1.5">▸ 価値提案</p>
              <p className="mb-4">「在庫精度が98%を超えた事例が3社ございまして、御社のような中堅メーカー様で特に効果が——」</p>
              <p className="text-[11px] font-bold tracking-[1px] text-[#0F1B2D]/50 mb-1.5">▸ 分岐：興味あり</p>
              <p className="mb-4 opacity-60">→ 詳細資料の送付提案へ</p>
              <p className="text-[11px] font-bold tracking-[1px] text-[#0F1B2D]/50 mb-1.5">▸ 分岐：忙しい</p>
              <p className="opacity-60">→ 別日アポ提案テンプレートへ</p>
            </div>
            <div className="mt-5 px-3.5 py-3 bg-[#F6F4EE] border border-dashed border-[#E5E1D7] rounded-lg text-[11px] text-[#4A5A6E] text-center">
              ※ 実際の生成例はフォームで試してみてください
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
