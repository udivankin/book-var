import type {
  ActiveRewardMarker,
  DictionaryNode,
  ParsedDictionaryEntry,
  ParsedSpaceNode,
  ParsedSymbolNode,
  ParsedSyllable,
  ParsedWordNode,
  RewardMarker,
} from "../types/dictionary";
import { formatReaderDisplayText, normalizeSpeechText } from "./wordParser";

const LETTER_PATTERN = /[A-Za-zА-Яа-яЁё]/;

const EMPTY_PARSED_ENTRY: ParsedDictionaryEntry = {
  rawText: "",
  displayText: "",
  speechText: "",
  nodes: [],
  syllables: [],
  rewardMarkers: [],
};

export function stripRewardAnnotations(input: string): string {
  return input
    .replace(/\[([^[\]]+)\]/g, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseDisplayText(displayText: string): Pick<ParsedDictionaryEntry, "displayText" | "nodes" | "speechText" | "syllables"> {
  if (!displayText) {
    return {
      displayText,
      nodes: [],
      speechText: "",
      syllables: [],
    };
  }

  const nodes: DictionaryNode[] = [];
  const syllables: ParsedSyllable[] = [];
  let speechCursor = 0;
  let syllableIndex = 0;
  let wordIndex = 0;

  for (const segment of displayText.split(/(\s+)/).filter(Boolean)) {
    if (/^\s+$/.test(segment)) {
      const spaceNode: ParsedSpaceNode = {
        type: "space",
        text: segment,
      };

      nodes.push(spaceNode);
      speechCursor += segment.length;
      continue;
    }

    if (LETTER_PATTERN.test(segment)) {
      const wordSpeechText = normalizeSpeechText(segment);
      const wordSpeechStartCharIndex = speechCursor;
      const wordSyllables: ParsedSyllable[] = [];
      let syllableSpeechCursor = 0;

      for (const rawSyllable of segment.split("-")) {
        const speechText = normalizeSpeechText(rawSyllable);
        const parsedSyllable: ParsedSyllable = {
          type: "syllable",
          index: syllableIndex,
          rawText: rawSyllable,
          textWithAccent: formatReaderDisplayText(rawSyllable, true),
          textWithoutAccent: formatReaderDisplayText(rawSyllable, false),
          speechText,
          speechLength: speechText.length,
          speechStartCharIndex: speechCursor + syllableSpeechCursor,
          wordIndex,
        };

        wordSyllables.push(parsedSyllable);
        syllables.push(parsedSyllable);
        syllableIndex += 1;
        syllableSpeechCursor += speechText.length;
      }

      const wordNode: ParsedWordNode = {
        type: "word",
        index: wordIndex,
        rawText: segment,
        speechText: wordSpeechText,
        speechStartCharIndex: wordSpeechStartCharIndex,
        syllables: wordSyllables,
      };

      nodes.push(wordNode);
      speechCursor += wordSpeechText.length;
      wordIndex += 1;
      continue;
    }

    const symbolSpeechText = normalizeSpeechText(segment);
    const symbolNode: ParsedSymbolNode = {
      type: "symbol",
      rawText: segment,
      textWithAccent: formatReaderDisplayText(segment, true),
      textWithoutAccent: formatReaderDisplayText(segment, false),
      speechText: symbolSpeechText,
      speechLength: symbolSpeechText.length,
      speechStartCharIndex: speechCursor,
    };

    nodes.push(symbolNode);
    speechCursor += symbolSpeechText.length;
  }

  return {
    displayText,
    nodes,
    speechText: normalizeSpeechText(displayText),
    syllables,
  };
}

function getLastReadableSyllableIndex(displayText: string): number {
  const parsedPrefix = parseDisplayText(displayText);
  return parsedPrefix.syllables.at(-1)?.index ?? -1;
}

function extractRewardMarkers(input: string): RewardMarker[] {
  const rewardMarkers: RewardMarker[] = [];

  for (const match of input.matchAll(/\[([^[\]]+)\]/g)) {
    const [, emoji] = match;
    const matchIndex = match.index ?? -1;
    const prefix = stripRewardAnnotations(input.slice(0, matchIndex));

    if (!emoji.trim()) {
      continue;
    }

    rewardMarkers.push({
      emoji: emoji.trim(),
      revealAfterSyllableIndex: getLastReadableSyllableIndex(prefix),
    });
  }

  return rewardMarkers;
}

export function parseDictionaryEntry(input: string): ParsedDictionaryEntry {
  if (!input) {
    return EMPTY_PARSED_ENTRY;
  }

  const displayText = stripRewardAnnotations(input);
  const parsedEntry = parseDisplayText(displayText);

  return {
    rawText: input,
    ...parsedEntry,
    rewardMarkers: extractRewardMarkers(input),
  };
}

export function parseDictionaryText(text: string): ParsedDictionaryEntry[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseDictionaryEntry);
}

export function getActiveRewardMarker(
  entry: ParsedDictionaryEntry,
  currentSyllableIndex: number,
  isWordFinished: boolean,
): ActiveRewardMarker | null {
  let activeMarker: RewardMarker | null = null;
  let activeMarkerIndex = -1;

  entry.rewardMarkers.forEach((marker, markerIndex) => {
    const isRevealed =
      currentSyllableIndex > marker.revealAfterSyllableIndex ||
      (isWordFinished && currentSyllableIndex >= marker.revealAfterSyllableIndex);

    if (isRevealed) {
      activeMarker = marker;
      activeMarkerIndex = markerIndex;
    }
  });

  if (!activeMarker) {
    return null;
  }

  return {
    ...activeMarker,
    key: `${entry.rawText}::${activeMarkerIndex}::${activeMarker.revealAfterSyllableIndex}`,
  };
}
