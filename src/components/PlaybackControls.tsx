import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Level } from "../types/app";

type PlaybackControlsProps = {
  dictionaryLength: number;
  isWordFinished: boolean;
  level: Level;
  loading: boolean;
  onNextItem: () => void;
  onPreviousItem: () => void;
  onPrimaryAction: () => void;
};

export function PlaybackControls({
  dictionaryLength,
  isWordFinished,
  level,
  loading,
  onNextItem,
  onPreviousItem,
  onPrimaryAction,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 w-full">
      <button
        onClick={onPreviousItem}
        disabled={loading || dictionaryLength === 0}
        className="disabled:opacity-50 p-4 md:p-5 rounded-[24px] bg-white text-natural-clay border-b-6 border-[#D1CEC4] hover:translate-y-[2px] active:translate-y-[4px] transition-transform shadow-lg"
        title="Предыдущий пример"
      >
        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      <button
        onClick={onPrimaryAction}
        disabled={loading}
        className={`disabled:opacity-50 px-8 py-5 md:px-12 md:py-6 text-white font-[800] text-lg md:text-xl rounded-[24px] border-b-6 hover:translate-y-[2px] active:translate-y-[4px] transition-transform shadow-lg flex items-center gap-4 ${
          level === "words" ? "bg-natural-sage border-[#5D705B]" : "bg-natural-ochre border-[#A67E56]"
        }`}
      >
        <div className="w-12 h-3 border-2 border-white/80 rounded-full" />
        <span className="flex items-center">
          <span>ПРОБЕЛ</span>
          <span aria-hidden="true" className="px-6">
            |
          </span>
          <span>{isWordFinished ? "ДАЛЬШЕ" : "ЧИТАТЬ"}</span>
        </span>
      </button>

      <button
        onClick={onNextItem}
        disabled={loading || dictionaryLength === 0}
        className="disabled:opacity-50 p-4 md:p-5 rounded-[24px] bg-white text-natural-clay border-b-6 border-[#D1CEC4] hover:translate-y-[2px] active:translate-y-[4px] transition-transform shadow-lg"
        title="Следующий пример"
      >
        <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
      </button>
    </div>
  );
}
