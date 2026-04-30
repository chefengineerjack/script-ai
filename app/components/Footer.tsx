import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400">© 2025 エムアンドワイ</p>
        <nav className="flex items-center gap-5">
          <Link
            href="/legal/tokushoho"
            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
          >
            特定商取引法に基づく表記
          </Link>
          <Link
            href="/legal/privacy"
            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
          >
            プライバシーポリシー
          </Link>
        </nav>
      </div>
    </footer>
  );
}
