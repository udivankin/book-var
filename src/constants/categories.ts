import type { Category, Level } from "../types/app";

export const CATEGORIES: Record<Level, Category[]> = {
  words: [
    { id: "first_words", name: "🌟 Первые слова", file: "data/words/first_words.txt" },
    { id: "animals", name: "🦁 Животные", file: "data/words/animals.txt" },
    { id: "food", name: "🍎 Еда", file: "data/words/food.txt" },
    { id: "colors", name: "🎨 Цвета", file: "data/words/colors.txt" },
    { id: "transport", name: "🚗 Транспорт", file: "data/words/transport.txt" },
    { id: "nature", name: "🌳 Природа", file: "data/words/nature.txt" },
    { id: "home", name: "🏠 Дом", file: "data/words/home.txt" },
    { id: "toys", name: "🧸 Игрушки", file: "data/words/toys.txt" },
    { id: "red", name: "🍎 Красное", file: "data/words/red.txt" },
    { id: "fast", name: "🚀 Быстрое", file: "data/words/fast.txt" },
  ],
  sentences: [
    { id: "basics", name: "📖 Первые фразы", file: "data/sentences/basics.txt" },
    { id: "family", name: "👨‍👩‍👧 Семья", file: "data/sentences/family.txt" },
    { id: "actions", name: "🏃 Действия", file: "data/sentences/actions.txt" },
    { id: "weather", name: "🌈 Погода", file: "data/sentences/weather.txt" },
    { id: "polite", name: "🤝 Вежливость", file: "data/sentences/polite.txt" },
    { id: "daily", name: "⏰ Режим дня", file: "data/sentences/daily.txt" },
    { id: "emotions", name: "😊 Эмоции", file: "data/sentences/emotions.txt" },
    { id: "play", name: "🧩 Игры", file: "data/sentences/play.txt" },
    { id: "shapes", name: "🔴 Цвета и формы", file: "data/sentences/shapes.txt" },
    { id: "animals_sentences", name: "🐱 Про зверей", file: "data/sentences/animals.txt" },
  ],
};

