"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import tips, { type Tip } from "@/app/data/tips";

const AUTO_ROTATE_MS = 8000;

function pickRandom(excludeId?: number): Tip {
  const pool = excludeId !== undefined
    ? tips.filter((t) => t.id !== excludeId)
    : tips;
  return pool[Math.floor(Math.random() * pool.length)];
}

type Props = {
  /** ローディング中か否か。false になると自動切り替え・ボタンを停止する */
  isLoading: boolean;
};

export default function LoadingTips({ isLoading }: Props) {
  const [tip, setTip] = useState<Tip>(() => pickRandom());
  const [visible, setVisible] = useState(true); // フェードアニメーション用
  const [timerKey, setTimerKey] = useState(0);  // インクリメントでタイマーリセット

  // フェード付きで Tips を切り替える
  const currentIdRef = useRef(tip.id);
  const changeTip = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      const next = pickRandom(currentIdRef.current);
      currentIdRef.current = next.id;
      setTip(next);
      setVisible(true);
    }, 200);
  }, []);

  // 8秒自動切り替え（isLoading が true の間のみ）
  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(changeTip, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [isLoading, timerKey, changeTip]);

  // 「次のTips →」ボタン押下：タイマーリセット + 即切り替え
  function handleNext() {
    changeTip();
    setTimerKey((k) => k + 1);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 space-y-2.5">
          {/* ヘッダー */}
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
              {tip.category}
            </span>
          </div>

          {/* タイトル */}
          <p className="text-sm font-semibold text-gray-800">{tip.title}</p>

          {/* 本文 */}
          <p className="text-sm text-gray-600 leading-relaxed">{tip.body}</p>

          {/* 次のTipsボタン（ローディング中のみ表示） */}
          {isLoading && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleNext}
                className="text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors"
              >
                次のTips →
              </button>
              <span className="text-[10px] text-amber-400">
                {AUTO_ROTATE_MS / 1000}秒ごとに自動更新
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
