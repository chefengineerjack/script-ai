import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0F1B2D] border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[#F6F4EE]/50">© 2025 エムアンドワイ</p>
        <nav className="flex items-center gap-5">
          <Link
            href="/legal/tokushoho"
            className="text-xs text-[#F6F4EE]/50 hover:text-[#C8FF3E] transition-colors"
          >
            特定商取引法に基づく表記
          </Link>
          <Link
            href="/legal/privacy"
            className="text-xs text-[#F6F4EE]/50 hover:text-[#C8FF3E] transition-colors"
          >
            プライバシーポリシー
          </Link>
        </nav>
      </div>
    </footer>
  );
}
