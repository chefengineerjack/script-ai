export default function BeforeAfter() {
  return (
    <section className="bg-[#F6F4EE] text-[#0F1B2D] px-6 py-20 md:px-16 md:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Label */}
        <p className="text-[12px] font-bold tracking-[1.5px] text-[#4A5A6E] text-center mb-4">BEFORE / AFTER</p>
        <h2 className="font-black text-[28px] md:text-[48px] tracking-[-1.5px] leading-[1.1] text-center mb-14">
          30秒で、ここまで変わる。
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before card */}
          <div className="rounded-[20px] border-2 border-[#E5E1D7] bg-white p-8 opacity-70">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5E1D7] text-[#4A5A6E] text-[11px] font-bold tracking-[1px] mb-5">
              ✗ BEFORE
            </div>
            <p className="text-[13px] font-bold text-[#4A5A6E] uppercase tracking-[1px] mb-3">テンプレ任せの硬いトーク</p>
            <div className="space-y-3 text-[14px] text-[#4A5A6E] leading-[1.7]">
              <p className="line-through">「初めてお電話いたします。私、〇〇会社の△△と申します。本日は弊社のサービスについてご案内させていただきたく——」</p>
              <p className="line-through">「ご多忙のところ大変恐縮ではございますが、少しだけお時間をいただけますでしょうか？」</p>
              <p className="line-through">「一度ご提案させていただけませんでしょうか？」</p>
            </div>
            <div className="mt-5 flex items-center gap-2 text-[12px] text-[#4A5A6E]">
              <span className="text-red-400">✗</span> どの業種にも当てはまる汎用トーク
            </div>
          </div>

          {/* After card */}
          <div className="rounded-[20px] border-2 border-[#C8FF3E] bg-white p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8FF3E] text-[#0F1B2D] text-[11px] font-bold tracking-[1px] mb-5">
              ✓ AFTER
            </div>
            <p className="text-[13px] font-bold text-[#0F1B2D] uppercase tracking-[1px] mb-3">業種最適化された会話</p>
            <div className="space-y-3 text-[14px] text-[#0F1B2D] leading-[1.7]">
              <p>「製造業の在庫精度でお悩みの経営者様へ——弊社の導入企業では3ヶ月で98%超を達成しました」</p>
              <p>「御社の直近の決算で原価率が上昇傾向と拝見しまして、在庫ロスとの相関が気になりました」</p>
              <p>「今週木曜に15分だけ。数字だけ見ていただければ、話は2分で終わります」</p>
            </div>
            <div className="mt-5 flex items-center gap-2 text-[12px] text-[#0F1B2D]">
              <span className="text-[#1F8A5B]">✓</span> 業種・役職・商材に最適化されたトーク
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
