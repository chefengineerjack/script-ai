import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-8">
        {/* チェックマークアイコン */}
        <div className="mx-auto h-20 w-20 rounded-full bg-[#C8FF3E] flex items-center justify-center shadow-[0_8px_32px_rgba(15,27,45,0.12)]">
          <svg
            className="h-10 w-10 text-[#0F1B2D]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* メッセージ */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-[#0F1B2D]">
            スタンダードプランへようこそ！
          </h1>
          <p className="text-[#4A5A6E] leading-relaxed">
            月30回スクリプトを生成できます。<br />
            企業分析・分岐フローチャートも含む<br />
            すべての機能をお使いいただけます。
          </p>
        </div>

        {/* プラン詳細バッジ */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#C8FF3E] border border-[#C8FF3E] px-5 py-2">
          <span className="text-sm font-bold text-[#0F1B2D]">✨ スタンダードプラン</span>
          <span className="text-xs text-[#0F1B2D]/60">月30回</span>
        </div>

        {/* ボタン */}
        <div className="space-y-3">
          <Link
            href="/#form"
            className="block rounded-[14px] bg-[#0F1B2D] px-8 py-3.5 text-sm font-black text-[#C8FF3E] hover:opacity-90 transition-opacity"
          >
            スクリプト生成を始める
          </Link>
          <Link
            href="/"
            className="block text-sm text-[#4A5A6E] hover:text-[#0F1B2D] transition-colors"
          >
            トップページへ
          </Link>
        </div>
      </div>
    </div>
  );
}
