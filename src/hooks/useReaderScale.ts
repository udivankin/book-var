import type { Level, ScaleStyles } from "../types/app";

export function getReaderScaleStyles(charCount: number, level: Level): ScaleStyles {
  if (level === "words") {
    if (charCount > 6) {
      const factor = Math.max(0.4, 6 / charCount);
      return {
        container: "gap-2 md:gap-6",
        fontSize: `clamp(1.5rem, ${4 * factor}vw, ${100 * factor}px)`,
        padding: charCount > 10 ? "px-2 py-1 md:px-4 md:py-3" : "px-4 py-3 md:px-8 md:py-6",
      };
    }

    return {
      container: "gap-4 md:gap-12 lg:gap-16",
      fontSize: "",
      padding: "px-4 py-3 md:px-8 md:py-6 lg:px-12 lg:py-8",
    };
  }

  if (charCount > 25) {
    const factor = Math.max(0.5, 25 / charCount);
    return {
      container: "gap-x-2 gap-y-3 md:gap-x-4 md:gap-y-4",
      fontSize: `clamp(0.875rem, ${2 * factor}vw, ${32 * factor}px)`,
      padding: "px-2 py-1.5 md:px-4 md:py-2",
    };
  }

  return {
    container: "gap-x-4 gap-y-6 md:gap-x-8 md:gap-y-8 lg:gap-x-12 lg:gap-y-10",
    fontSize: "",
    padding: "px-2 py-1.5 md:px-5 md:py-3 lg:px-8 lg:py-5",
  };
}
