import { Tag, Upload } from "lucide-react";
import { CATEGORIES } from "../constants/categories";
import type { Level } from "../types/app";
import { LevelSwitcher } from "./LevelSwitcher";

type CategorySidebarProps = {
  activeCategory: string;
  level: Level;
  onOpenUpload: () => void;
  onSelectCategory: (categoryId: string) => void;
  onSwitchLevel: (level: Level) => void;
};

export function CategorySidebar({
  activeCategory,
  level,
  onOpenUpload,
  onSelectCategory,
  onSwitchLevel,
}: CategorySidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 pr-8 z-20 sticky top-8 h-fit">
      <LevelSwitcher level={level} onSwitch={onSwitchLevel} />

      <div className="bg-white/50 backdrop-blur rounded-[32px] p-6 border-4 border-[#E5E1D3] shadow-inner">
        <div className="flex items-center gap-2 mb-6 text-natural-sage">
          <Tag className="w-5 h-5" />
          <h3 className="font-black uppercase tracking-widest text-sm">Категории</h3>
        </div>

        <div className="flex flex-col gap-2">
          {CATEGORIES[level].map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`text-left px-4 py-2 rounded-xl font-bold transition-all text-sm ${
                activeCategory === category.id
                  ? "bg-natural-sage text-white shadow-md -translate-x-1"
                  : "text-gray-400 hover:text-natural-sage hover:bg-white"
              }`}
            >
              {category.name}
            </button>
          ))}

          <div className="mt-2 pt-2 border-t-2 border-[#E5E1D3] border-dashed">
            <button
              onClick={onOpenUpload}
              className="w-full text-left px-4 py-2 rounded-xl font-bold text-xs text-natural-ochre hover:bg-white transition-all flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              Свой список
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

