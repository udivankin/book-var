import type { ReadingSpeed } from "../types/app";

export const DEFAULT_READING_SPEED: ReadingSpeed = "walk";

export const READING_SPEED_RATES: Record<ReadingSpeed, number> = {
  turtle: 0.7,
  walk: 0.85,
  run: 1.05,
};

export const READING_SPEED_OPTIONS: Array<{
  id: ReadingSpeed;
  emoji: string;
  rate: number;
  title: string;
}> = [
  { id: "turtle", emoji: "🐢", rate: READING_SPEED_RATES.turtle, title: "Медленная скорость чтения" },
  { id: "walk", emoji: "🚶", rate: READING_SPEED_RATES.walk, title: "Средняя скорость чтения" },
  { id: "run", emoji: "🏃", rate: READING_SPEED_RATES.run, title: "Быстрая скорость чтения" },
];

export function isReadingSpeed(value: string | null): value is ReadingSpeed {
  return READING_SPEED_OPTIONS.some((option) => option.id === value);
}
