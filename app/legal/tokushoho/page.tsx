import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const ITEMS = [
  { label: "販売事業者名", value: "エムアンドワイ" },
  { label: "代表者名", value: "高木 良和" },
  { label: "所在地", value: "東京都港区港南（詳細住所は請求があり次第遅滞なく開示します）" },
  { label: "電話番号", value: "請求があり次第遅滞なく開示します" },
  { label: "メールアドレス", value: "お問い合わせフォームをご利用ください" },
  {
    label: "販売価格",
    value: "スクリプトAI スタンダードプラン 月額980円（税込）",
  },
  {
    label: "支払方法",
    value: "クレジットカード決済（Stripe経由）\nVisa・Mastercard・American Express・JCB等",
  },
  { label: "支払時期", value: "お申し込み時に決済が確定します。以降は毎月同日に自動更新されます。" },
  { label: "サービス提供時期", value: "決済完了後すぐにご利用いただけます。" },
  {
    label: "返品・キャンセルについて",
    value:
      "マイページからいつでも解約可能です。解約後は次回更新日以降の課金が停止されます。\nすでに決済済みの期間に対する日割り返金は行いません。",
  },
  { label: "動作環境", value: "インターネット接続環境および対応ブラウザが必要です。" },
];

export default function TokushohoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4EE]">
      <Navbar />

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {/* ヘッダー */}
          <div className="mb-10 space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-[#4A5A6E] hover:text-[#0F1B2D] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              トップへ戻る
            </Link>
            <h1 className="text-2xl font-black text-[#0F1B2D]">
              特定商取引法に基づく表記
            </h1>
            <p className="text-sm text-[#4A5A6E]">
              特定商取引法第11条に基づく通信販売の表示
            </p>
          </div>

          {/* テーブル */}
          <div className="bg-white rounded-[20px] border-2 border-[#0F1B2D] overflow-hidden shadow-[0_8px_32px_rgba(15,27,45,0.08)]">
            <table className="w-full">
              <tbody className="divide-y divide-[#E5E1D7]">
                {ITEMS.map(({ label, value }) => (
                  <tr key={label} className="flex flex-col sm:table-row">
                    <th className="bg-[#F6F4EE] px-6 py-4 text-left text-sm font-bold text-[#0F1B2D] sm:w-48 sm:shrink-0 whitespace-nowrap align-top">
                      {label}
                    </th>
                    <td className="px-6 py-4 text-sm text-[#4A5A6E] leading-relaxed whitespace-pre-line">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* お問い合わせ */}
          <div className="mt-8 rounded-[14px] bg-[#C8FF3E]/20 border border-[#C8FF3E]/40 px-6 py-5">
            <p className="text-sm font-bold text-[#0F1B2D] mb-1">お問い合わせ</p>
            <p className="text-sm text-[#4A5A6E]">
              ご不明な点は下記フォームよりご連絡ください。
            </p>
            <a
              href="https://forms.gle/33Gw9t2Ppt7V5dmu9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-[#0F1B2D] underline underline-offset-2 hover:bg-[#C8FF3E] transition-colors font-medium"
            >
              お問い合わせフォーム
            </a>
          </div>

          <p className="mt-6 text-xs text-[#4A5A6E] text-right">最終更新：2025年5月</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
