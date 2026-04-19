import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { CATEGORIES } from "../constants/categories";
import type { ParsedDictionaryEntry } from "../types/dictionary";
import type { Level } from "../types/app";
import { parseDictionaryEntry, parseDictionaryText } from "../utils/dictionaryEntry";

type UseDictionaryParams = {
  activeCategory: string;
  level: Level;
  onResetPlayback: () => void;
};

type DictionaryState = {
  currentEntry: ParsedDictionaryEntry;
  currentWordIndex: number;
  dictionary: ParsedDictionaryEntry[];
  loading: boolean;
  setCustomDictionary: (lines: string[]) => void;
  setCurrentWordIndex: Dispatch<SetStateAction<number>>;
};

const EMPTY_ENTRY = parseDictionaryEntry("");

export function useDictionary({
  activeCategory,
  level,
  onResetPlayback,
}: UseDictionaryParams): DictionaryState {
  const [dictionary, setDictionary] = useState<ParsedDictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (dictionary.length > 0 && activeCategory !== "custom") {
      localStorage.setItem(`bukvar-progress-${level}-${activeCategory}`, String(currentWordIndex));
    }
  }, [activeCategory, currentWordIndex, dictionary.length, level]);

  useEffect(() => {
    const category = CATEGORIES[level].find((item) => item.id === activeCategory) || CATEGORIES[level][0];
    const dictionaryUrl = `${category.file}?v=${encodeURIComponent(__APP_BUILD_ID__)}`;

    setLoading(true);
    fetch(dictionaryUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load dictionary: ${response.status}`);
        }

        return response.text();
      })
      .then((text) => {
        const lines = parseDictionaryText(text);
        const savedProgress = localStorage.getItem(`bukvar-progress-${level}-${activeCategory}`);
        const index = savedProgress ? parseInt(savedProgress, 10) : 0;

        setDictionary(lines);
        setCurrentWordIndex(index < lines.length ? index : 0);
        onResetPlayback();
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load category:", error);
        setLoading(false);
      });
  }, [activeCategory, level, onResetPlayback]);

  const setCustomDictionary = useCallback(
    (lines: string[]) => {
      setDictionary(lines.map(parseDictionaryEntry));
      setCurrentWordIndex(0);
      onResetPlayback();
      setLoading(false);
    },
    [onResetPlayback],
  );

  return {
    currentEntry: dictionary[currentWordIndex] || EMPTY_ENTRY,
    currentWordIndex,
    dictionary,
    loading,
    setCustomDictionary,
    setCurrentWordIndex,
  };
}
