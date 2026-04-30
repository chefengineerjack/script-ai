import Navbar from "@/app/components/Navbar";
import ScriptForm from "@/app/components/ScriptForm";
import PricingSection from "@/app/components/PricingSection";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* ヒーロー + フォームセクション */}
      <div id="form" className="scroll-mt-14 px-6 py-16">
        <div className="mx-auto max-w-2xl space-y-10">
          {/* ヒーローセクション */}
          <div className="text-center space-y-4">
            <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
              AIパワード
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              営業スクリプトAI
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              顧客情報を入力するだけで、成約率を高める最適な営業スクリプトをAIが自動生成します。
            </p>
          </div>

          {/* 入力フォーム */}
          <ScriptForm />

          <p className="text-center text-sm text-gray-400">
            クレジットカード不要・今すぐ無料で試せます
          </p>
        </div>
      </div>

      {/* 料金プランセクション */}
      <div className="bg-white/50 backdrop-blur-sm">
        <PricingSection />
      </div>

      <Footer />
    </main>
  );
}
