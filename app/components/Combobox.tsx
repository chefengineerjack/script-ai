"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  usedValues?: string[];
  usedLabel?: string;
  optionsLabel?: string;
  placeholder?: string;
};

export default function Combobox({
  value,
  onChange,
  options,
  usedValues = [],
  usedLabel = "この企業で使用済み",
  optionsLabel = "候補",
  placeholder = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const lowerQuery = value.toLowerCase();
  const filteredUsed = usedValues.filter(
    (v) => v.toLowerCase().includes(lowerQuery) && !options.includes(v)
  );
  const filteredOptions = options.filter((v) => v.toLowerCase().includes(lowerQuery));

  type Item = { val: string };
  const allItems: Item[] = [
    ...filteredUsed.map((v) => ({ val: v })),
    ...filteredOptions.map((v) => ({ val: v })),
  ];

  function select(val: string) {
    onChange(val);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) { setOpen(true); break; }
        setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (open && activeIndex >= 0 && allItems[activeIndex]) {
          select(allItems[activeIndex].val);
        } else {
          setOpen(false);
        }
        break;
      case "Escape":
        setOpen(false);
        setActiveIndex(-1);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const showDropdown = open && (filteredUsed.length > 0 || filteredOptions.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        className="w-full rounded-[12px] border-[1.5px] border-[#E5E1D7] bg-white px-3.5 py-2.5 text-sm text-[#0F1B2D] focus:border-[#0F1B2D] focus:outline-none focus:ring-2 focus:ring-[#0F1B2D]/10 transition pr-8"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className={`w-4 h-4 text-[#4A5A6E] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-[12px] border border-[#E5E1D7] shadow-lg max-h-56 overflow-y-auto">
          {filteredUsed.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4A5A6E] bg-[#F6F4EE] border-b border-[#E5E1D7]">
                {usedLabel}
              </div>
              {filteredUsed.map((item, i) => (
                <button
                  key={`u-${item}`}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); select(item); }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                    activeIndex === i ? "bg-[#0F1B2D] text-[#C8FF3E]" : "text-[#0F1B2D] hover:bg-[#F6F4EE]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </>
          )}
          {filteredOptions.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4A5A6E] bg-[#F6F4EE] border-b border-[#E5E1D7]">
                {optionsLabel}
              </div>
              {filteredOptions.map((item, i) => {
                const gi = filteredUsed.length + i;
                return (
                  <button
                    key={`o-${item}`}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); select(item); }}
                    onMouseEnter={() => setActiveIndex(gi)}
                    className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                      activeIndex === gi ? "bg-[#0F1B2D] text-[#C8FF3E]" : "text-[#0F1B2D] hover:bg-[#F6F4EE]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
