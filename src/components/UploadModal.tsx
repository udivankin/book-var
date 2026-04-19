import type { ChangeEvent } from "react";
import { motion } from "motion/react";
import { Trash2, Upload } from "lucide-react";
import type { Level } from "../types/app";

type UploadModalProps = {
  level: Level;
  onClose: () => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function UploadModal({ level, onClose, onFileUpload }: UploadModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Trash2 className="w-5 h-5 text-gray-400" />
        </button>

        <h2 className="text-2xl font-black mb-4">Твой словарь ({level === "words" ? "Слова" : "Предложения"})</h2>
        <p className="text-gray-500 mb-6 font-medium">
          Загрузи файл .txt, где слоги разделены минусом, ударение - большая буква, а награда может быть эмодзи или SVG в скобках: ко-рО-ва[🐄], гра-нат[гранат.svg].
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-[#E1EEFF] rounded-2xl cursor-pointer hover:bg-[#F0F7FF] transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-natural-sage mb-3" />
              <p className="text-sm font-bold text-gray-600">Нажми чтобы выбрать файл</p>
            </div>
            <input type="file" className="hidden" accept=".txt,.json" onChange={onFileUpload} />
          </label>

          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-xl active:scale-[0.98] transition-all"
          >
            Отмена
          </button>
        </div>
      </motion.div>
    </div>
  );
}

