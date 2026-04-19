
/**
 * Utility to parse words and sentences with syllable separators and stress markers.
 * Format: "ко-рО-ва", "мА-ма мО-ет рА-му"
 */

export function normalizeSpeechText(input: string): string {
  return input.toLowerCase().replace(/\u0301/g, "").replace(/-/g, "");
}

function isYo(char: string): boolean {
  return char === "Ё" || char === "ё";
}

export function formatTextWithAccent(input: string, showAccent: boolean = true): string {
  let result = "";

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (char === "\u0301") {
      if (showAccent) {
        result += char;
      }
      continue;
    }

    if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      result += char.toLowerCase() + (showAccent && !isYo(char) ? "\u0301" : "");
    } else {
      result += char;
    }
  }

  return result;
}

export function formatReaderDisplayText(input: string, showAccent: boolean = true): string {
  return formatTextWithAccent(input, showAccent).toLocaleUpperCase("ru-RU");
}

export function parseSyllablesWithAccent(input: string, showAccent: boolean = true): string[] {
  if (!input) return [];

  const words = input.split(" ");
  const result: string[] = [];

  words.forEach((word, wordIdx) => {
    const syllables = word.split("-");
    syllables.forEach((syllable) => {
      result.push(formatTextWithAccent(syllable, showAccent));
    });

    if (wordIdx < words.length - 1) {
      result.push(" ");
    }
  });

  return result;
}
