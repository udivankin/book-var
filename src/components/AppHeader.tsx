import { Type, Volume2 } from "lucide-react";
import { READING_SPEED_OPTIONS } from "../constants/readingSpeed";
import { CATEGORIES } from "../constants/categories";
import type { Level, ReadingSpeed } from "../types/app";

type AppHeaderProps = {
  activeCategory: string;
  currentWordIndex: number;
  dictionaryLength: number;
  level: Level;
  loading: boolean;
  readingSpeed: ReadingSpeed;
  showAccents: boolean;
  onSetReadingSpeed: (speed: ReadingSpeed) => void;
  onToggleAccents: () => void;
};

export function AppHeader({
  activeCategory,
  currentWordIndex,
  dictionaryLength,
  level,
  loading,
  readingSpeed,
  showAccents,
  onSetReadingSpeed,
  onToggleAccents,
}: AppHeaderProps) {
  const activeCategoryName = CATEGORIES[level].find((category) => category.id === activeCategory)?.name || "Пользовательский";

  return (
    <header className="w-full max-w-6xl 2xl:max-w-none flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-10 px-4 lg:px-0 z-10">
      <div className="flex flex-col gap-1 items-start">
        <h1 className="text-2xl md:text-3xl font-[800] tracking-[2px] text-natural-sage uppercase">
          Букварь Онлайн
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-natural-ochre uppercase tracking-widest bg-natural-ochre/10 px-2 py-0.5 rounded-full">
            {activeCategoryName}
          </p>
          {!loading && dictionaryLength > 0 && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {currentWordIndex + 1} из {dictionaryLength}
            </p>
          )}
        </div>
      </div>

      <div className="self-end flex items-center gap-2">
        <div className="flex items-center gap-1 p-1.5 bg-white border-b-4 border-[#D1CEC4] rounded-2xl shadow-sm">
          <div
            className="flex items-center justify-center w-8 h-8 text-natural-clay"
            title="Скорость чтения"
            aria-hidden="true"
          >
            <Volume2 className="w-4 h-4" />
          </div>

          {READING_SPEED_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSetReadingSpeed(option.id)}
              aria-pressed={readingSpeed === option.id}
              aria-label={option.title}
              className={`w-8 h-8 flex items-center justify-center rounded-xl text-base transition-all ${
                readingSpeed === option.id
                  ? "bg-natural-clay text-white shadow-sm"
                  : "text-gray-400 hover:text-natural-clay"
              }`}
              title={option.title}
            >
              <span aria-hidden="true">{option.emoji}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onToggleAccents}
          className={`p-2.5 bg-white border-b-4 border-[#D1CEC4] hover:translate-y-[1px] hover:border-b-2 active:translate-y-[4px] active:border-b-0 rounded-xl transition-all ${showAccents ? "text-natural-ochre" : "text-gray-300"}`}
          title={showAccents ? "Убрать ударения" : "Показать ударения"}
        >
          <Type className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
