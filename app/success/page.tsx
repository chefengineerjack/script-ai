import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-8">
        {/* チェックマークアイコン */}
        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center shadow-lg shadow-green-100">
          <svg
            className="h-10 w-10 text-green-600"
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
          <h1 className="text-2xl font-bold text-gray-900">
            スタンダードプランへようこそ！
          </h1>
          <p className="text-gray-600 leading-relaxed">
            月30回スクリプトを生成できます。<br />
            企業分析・分岐フローチャートも含む<br />
            すべての機能をお使いいただけます。
          </p>
        </div>

        {/* プラン詳細バッジ */}
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-5 py-2">
          <span className="text-sm font-medium text-indigo-700">✨ スタンダードプラン</span>
          <span className="text-xs text-indigo-500">月30回</span>
        </div>

        {/* ボタン */}
        <div className="space-y-3">
          <Link
            href="/#form"
            className="block rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition-colors"
          >
            スクリプト生成を始める
          </Link>
          <Link
            href="/"
            className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            トップページへ
          </Link>
        </div>
      </div>
    </div>
  );
}
