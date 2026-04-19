import { useEffect, useState } from "react";
import { DEFAULT_READING_SPEED, isReadingSpeed } from "../constants/readingSpeed";
import { CATEGORIES } from "../constants/categories";
import type { Level, ReadingSpeed } from "../types/app";

type BukvarSettings = {
  activeCategory: string;
  level: Level;
  readingSpeed: ReadingSpeed;
  setActiveCategory: (categoryId: string) => void;
  setLevel: (level: Level) => void;
  setReadingSpeed: (speed: ReadingSpeed) => void;
  showAccents: boolean;
  setShowAccents: (value: boolean) => void;
  switchLevel: (level: Level) => void;
};

export function useBukvarSettings(): BukvarSettings {
  const [level, setLevel] = useState<Level>(() => {
    return (localStorage.getItem("bukvar-level") as Level) || "words";
  });

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    const savedLevel = (localStorage.getItem("bukvar-level") as Level) || "words";
    return localStorage.getItem(`bukvar-category-${savedLevel}`) || CATEGORIES[savedLevel][0].id;
  });

  const [showAccents, setShowAccents] = useState<boolean>(() => {
    return localStorage.getItem("bukvar-accents") === "true";
  });

  const [readingSpeed, setReadingSpeed] = useState<ReadingSpeed>(() => {
    const savedSpeed = localStorage.getItem("bukvar-reading-speed");
    return isReadingSpeed(savedSpeed) ? savedSpeed : DEFAULT_READING_SPEED;
  });

  useEffect(() => {
    localStorage.setItem("bukvar-level", level);
  }, [level]);

  useEffect(() => {
    localStorage.setItem(`bukvar-category-${level}`, activeCategory);
  }, [activeCategory, level]);

  useEffect(() => {
    localStorage.setItem("bukvar-accents", String(showAccents));
  }, [showAccents]);

  useEffect(() => {
    localStorage.setItem("bukvar-reading-speed", readingSpeed);
  }, [readingSpeed]);

  const switchLevel = (newLevel: Level) => {
    if (newLevel === level) return;

    setLevel(newLevel);
    const savedCategory = localStorage.getItem(`bukvar-category-${newLevel}`);
    setActiveCategory(savedCategory || CATEGORIES[newLevel][0].id);
  };

  return {
    activeCategory,
    level,
    readingSpeed,
    setActiveCategory,
    setLevel,
    setReadingSpeed,
    showAccents,
    setShowAccents,
    switchLevel,
  };
}
