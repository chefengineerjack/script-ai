export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <span className="text-base font-bold text-gray-900">営業スクリプトAI</span>
        <div className="flex items-center gap-2 sm:gap-5">
          <a
            href="#form"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors px-2 py-1"
          >
            スクリプト生成
          </a>
          <a
            href="#pricing"
            className="rounded-lg bg-indigo-50 px-3.5 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            料金プラン
          </a>
        </div>
      </div>
    </nav>
  );
}
