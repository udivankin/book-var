import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
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

function getProgressStorageKey(level: Level, categoryId: string): string | null {
  if (categoryId === "custom") {
    return null;
  }

  return `bukvar-progress-${level}-${categoryId}`;
}

export function useDictionary({
  activeCategory,
  level,
  onResetPlayback,
}: UseDictionaryParams): DictionaryState {
  const [dictionary, setDictionary] = useState<ParsedDictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const loadedProgressKeyRef = useRef<string | null>(getProgressStorageKey(level, activeCategory));

  useEffect(() => {
    if (dictionary.length > 0 && loadedProgressKeyRef.current) {
      localStorage.setItem(loadedProgressKeyRef.current, String(currentWordIndex));
    }
  }, [currentWordIndex, dictionary.length]);

  useEffect(() => {
    const category = CATEGORIES[level].find((item) => item.id === activeCategory) || CATEGORIES[level][0];
    const dictionaryUrl = `${category.file}?v=${encodeURIComponent(__APP_BUILD_ID__)}`;
    const progressStorageKey = getProgressStorageKey(level, activeCategory);

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
        const savedProgress = progressStorageKey ? localStorage.getItem(progressStorageKey) : null;
        const index = savedProgress ? parseInt(savedProgress, 10) : 0;

        loadedProgressKeyRef.current = progressStorageKey;
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
