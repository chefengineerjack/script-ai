import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {/* ヘッダー */}
          <div className="mb-10 space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              トップへ戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
            <p className="text-sm text-gray-500">
              エムアンドワイ（以下「当社」）は、営業スクリプトAI（以下「本サービス」）における
              個人情報の取り扱いについて、以下のとおり定めます。
            </p>
          </div>

          {/* 本文 */}
          <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100 divide-y divide-gray-100">

            {/* 1. 収集する情報 */}
            <section className="px-6 py-6 space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  1
                </span>
                収集する情報
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                本サービスでは、以下の情報を収集する場合があります。
              </p>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {[
                  "メールアドレス（アカウント登録時）",
                  "パスワード（ハッシュ化して保存。平文では保存しません）",
                  "サービスの利用履歴・生成回数",
                  "決済情報（クレジットカード情報はStripeが管理し、当社サーバーには保存しません）",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* 2. 利用目的 */}
            <section className="px-6 py-6 space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  2
                </span>
                利用目的
              </h2>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {[
                  "本サービスのアカウント管理および提供",
                  "利用状況の確認・利用制限の管理",
                  "お問い合わせ・サポート対応",
                  "サービスの改善・新機能開発",
                  "料金の請求・決済処理",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* 3. 第三者提供 */}
            <section className="px-6 py-6 space-y-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  3
                </span>
                第三者への提供
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                当社は、以下の場合を除き、収集した個人情報を第三者に提供しません。
              </p>
              <div className="space-y-3">
                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 space-y-1">
                  <p className="text-sm font-semibold text-gray-800">Stripe, Inc.（決済処理）</p>
                  <p className="text-sm text-gray-600">
                    スタンダードプランの決済処理のため、メールアドレスをStripeに提供します。
                    Stripeのプライバシーポリシーは
                    <a href="https://stripe.com/jp/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline underline-offset-1 hover:text-indigo-500 mx-1">
                      こちら
                    </a>
                    をご参照ください。
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 space-y-1">
                  <p className="text-sm font-semibold text-gray-800">OpenAI, L.L.C.（AI生成処理）</p>
                  <p className="text-sm text-gray-600">
                    スクリプト生成のため、入力されたテキスト情報をOpenAIのAPIに送信します。
                    ただし、個人を特定できる情報は含みません。
                  </p>
                </div>
              </div>
            </section>

            {/* 4. 入力した営業情報の取り扱い */}
            <section className="px-6 py-6 space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  4
                </span>
                入力した営業情報の取り扱い
              </h2>
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                <p className="text-sm text-indigo-900 leading-relaxed">
                  フォームに入力した業種・商材・企業名などの営業情報は、
                  <strong>スクリプトの生成処理のみに使用します。</strong>
                  当社のサーバーには保存せず、生成完了後に即時破棄されます。
                  第三者への提供や、マーケティング目的での利用は一切行いません。
                </p>
              </div>
            </section>

            {/* 5. Cookieについて */}
            <section className="px-6 py-6 space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  5
                </span>
                Cookieについて
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                本サービスはログイン状態の維持のためにCookie（httpOnly属性付きJWT）を使用します。
                第三者の広告・トラッキング目的のCookieは使用しません。
              </p>
            </section>

            {/* 6. 個人情報の管理 */}
            <section className="px-6 py-6 space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  6
                </span>
                個人情報の安全管理
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                収集した個人情報は、Upstash Redisを用いて暗号化通信（TLS）により管理します。
                パスワードはbcryptによりハッシュ化して保存し、平文では保持しません。
              </p>
            </section>

            {/* 7. ポリシーの変更 */}
            <section className="px-6 py-6 space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  7
                </span>
                プライバシーポリシーの変更
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                本ポリシーは予告なく変更する場合があります。
                重要な変更がある場合はサービス上でお知らせします。
                変更後もサービスを継続してご利用いただいた場合、変更後のポリシーに同意したものとみなします。
              </p>
            </section>

            {/* 8. お問い合わせ */}
            <section className="px-6 py-6 space-y-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  8
                </span>
                お問い合わせ
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                個人情報の開示・訂正・削除等のご請求、その他プライバシーに関するお問い合わせは
                下記フォームよりご連絡ください。
              </p>
              <a
                href="https://forms.gle/33Gw9t2Ppt7V5dmu9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-indigo-600 underline underline-offset-2 hover:text-indigo-500 transition-colors"
              >
                お問い合わせフォーム →
              </a>
            </section>
          </div>

          <p className="mt-6 text-xs text-gray-400 text-right">最終更新：2025年5月</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
