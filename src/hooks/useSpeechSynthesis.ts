import { useCallback, useEffect } from "react";
import { READING_SPEED_RATES } from "../constants/readingSpeed";
import type { ReadingSpeed } from "../types/app";
import type { ParsedDictionaryEntry, ParsedSyllable, ParsedWordNode } from "../types/dictionary";
import { normalizeSpeechText } from "../utils/wordParser";

type UseSpeechSynthesisParams = {
  readingSpeed: ReadingSpeed;
  onPhraseEnd: () => void;
  onPhraseReset: () => void;
  onSyllableChange: (index: number) => void;
};

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis;
}

export function useSpeechSynthesis({
  readingSpeed,
  onPhraseEnd,
  onPhraseReset,
  onSyllableChange,
}: UseSpeechSynthesisParams) {
  useEffect(() => {
    const speechSynthesis = getSpeechSynthesis();
    if (!speechSynthesis) return;

    const loadVoices = () => {
      speechSynthesis.getVoices();
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const cancelSpeech = useCallback(() => {
    getSpeechSynthesis()?.cancel();
  }, []);

  const createUtterance = useCallback((speechText: string) => {
    const speechSynthesis = getSpeechSynthesis();
    if (!speechSynthesis) return null;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    const voices = speechSynthesis.getVoices();
    const russianVoice =
      voices.find((voice) => voice.lang.includes("ru") || voice.lang.includes("RU")) ||
      voices.find((voice) => voice.name.toLowerCase().includes("russian"));

    if (russianVoice) {
      utterance.voice = russianVoice;
    }

    utterance.lang = "ru-RU";
    utterance.rate = READING_SPEED_RATES[readingSpeed];
    utterance.pitch = 1;

    return { speechSynthesis, utterance };
  }, [readingSpeed]);

  const speakText = useCallback(
    (text: string) => {
      const normalizedText = normalizeSpeechText(text);
      if (!normalizedText) return;

      const speech = createUtterance(normalizedText);
      if (!speech) return;

      speech.speechSynthesis.speak(speech.utterance);
    },
    [createUtterance],
  );

  const speakEntry = useCallback(
    (entry: ParsedDictionaryEntry) => {
      if (!entry.speechText) return;

      const speech = createUtterance(entry.speechText);
      if (!speech) return;

      const { speechSynthesis, utterance } = speech;
      const wordNodes = entry.nodes.filter((node): node is ParsedWordNode => node.type === "word" && node.syllables.length > 0);
      let syllableTimer: ReturnType<typeof setTimeout> | null = null;

      const clearSyllableTimer = () => {
        if (syllableTimer) {
          clearTimeout(syllableTimer);
          syllableTimer = null;
        }
      };

      const scheduleWordSyllables = (syllables: ParsedSyllable[], syllableOffset = 0) => {
        const currentSyllable = syllables[syllableOffset];
        const nextSyllable = syllables[syllableOffset + 1];

        if (!currentSyllable || !nextSyllable) {
          return;
        }

        const currentSyllableDuration = (Math.max(currentSyllable.speechLength, 1) * 50) / utterance.rate;
        syllableTimer = setTimeout(() => {
          onSyllableChange(nextSyllable.index);
          scheduleWordSyllables(syllables, syllableOffset + 1);
        }, currentSyllableDuration);
      };

      utterance.onboundary = (event) => {
        if (event.name !== "word") return;

        clearSyllableTimer();

        const activeWord =
          wordNodes.find((node) => node.speechStartCharIndex === event.charIndex) ||
          wordNodes.reduce<ParsedWordNode | undefined>(
            (previous, current) => (current.speechStartCharIndex <= event.charIndex ? current : previous),
            undefined,
          );

        if (!activeWord) return;

        onSyllableChange(activeWord.syllables[0].index);
        onPhraseReset();
        scheduleWordSyllables(activeWord.syllables);
      };

      utterance.onend = () => {
        clearSyllableTimer();
        onSyllableChange(entry.syllables.at(-1)?.index ?? 0);
        onPhraseEnd();

        setTimeout(() => {
          onSyllableChange(0);
          onPhraseReset();
        }, 800);
      };

      speechSynthesis.speak(utterance);
    },
    [createUtterance, onPhraseEnd, onPhraseReset, onSyllableChange],
  );

  return { cancelSpeech, speakEntry, speakText };
}
