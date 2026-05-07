const FAQS = [
  {
    icon: "💬",
    q: "AIが作ったトークで、本当に響くんですか？",
    a: "9業種×役職×目的の組み合わせで最適化。テンプレ任せではなく、入力した商材の情報をAIが解釈してゼロからスクリプトを構築するので、毎回違うトークが生まれます。叩き台として使い、自分の言葉に置き換えていく前提でも十分強力です。",
  },
  {
    icon: "🔒",
    q: "個人情報を入れるのが少し不安です。",
    a: "顧客の名前・連絡先などの個人情報は一切不要。入力するのは業種・役職・商材名など、機密性の低い項目のみ。生成された内容は学習用途には使用しません。",
  },
  {
    icon: "⚡",
    q: "生成にどのくらい時間がかかりますか？",
    a: "平均28秒。架電1分前に思い立っても間に合うスピードで生成します。電話スクリプト＋メール文面＋断り文句対応まで、一度に全部出力されます。",
  },
  {
    icon: "💳",
    q: "無料でどこまで使えますか？",
    a: "登録不要で1回、無料登録後は1日2回まで利用可能です。クレジットカードの登録は一切不要。スタンダードプラン（月額980円）にすると月30回まで使えます。",
  },
];

export default function FAQ() {
  return (
    <section className="bg-[#F6F4EE] text-[#0F1B2D] px-6 py-20 md:px-16 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-16 items-start">

          {/* Left: heading */}
          <div>
            <p className="text-[12px] font-bold tracking-[1.5px] text-[#4A5A6E] mb-4">FAQ</p>
            <h2 className="font-black text-[28px] md:text-[48px] tracking-[-1.5px] leading-[1.25] m-0">
              先に答えます。<br />
              みんなが気にする<br />
              <span
                className="bg-[#C8FF3E] px-2 [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
              >
                2つ
              </span>のこと。
            </h2>
          </div>

          {/* Right: FAQ cards */}
          <div className="space-y-5">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-[16px] border-[1.5px] border-[#E5E1D7] p-6 grid grid-cols-[auto_1fr] gap-5"
              >
                <div className="w-12 h-12 bg-[#C8FF3E] rounded-[12px] flex items-center justify-center text-xl shrink-0">
                  {faq.icon}
                </div>
                <div>
                  <p className="text-[16px] font-bold mb-2 leading-[1.3]">{faq.q}</p>
                  <p className="text-[14px] text-[#4A5A6E] leading-[1.7]">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
