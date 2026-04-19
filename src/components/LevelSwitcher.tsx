import type { Level } from "../types/app";

type LevelSwitcherProps = {
  level: Level;
  onSwitch: (level: Level) => void;
  mobile?: boolean;
};

export function LevelSwitcher({ level, onSwitch, mobile = false }: LevelSwitcherProps) {
  const containerClass = mobile
    ? "flex bg-white shadow-sm p-1 rounded-xl border-2 border-[#E5E1D3]"
    : "flex bg-white/50 backdrop-blur p-1 rounded-2xl border-4 border-[#E5E1D3] shadow-inner mb-6";
  const buttonClass = mobile ? "rounded-lg" : "rounded-xl";
  const sentencesLabel = mobile ? "ПРЕДЛОЖЕНИЯ" : "ФРАЗЫ";

  return (
    <div className={containerClass}>
      <button
        onClick={() => onSwitch("words")}
        className={`flex-1 py-2 text-xs font-black transition-all ${buttonClass} ${level === "words" ? "bg-natural-sage text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
      >
        СЛОВА
      </button>
      <button
        onClick={() => onSwitch("sentences")}
        className={`flex-1 py-2 text-xs font-black transition-all ${buttonClass} ${level === "sentences" ? "bg-natural-ochre text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
      >
        {sentencesLabel}
      </button>
    </div>
  );
}

