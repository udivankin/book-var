import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import confetti from "canvas-confetti";
import { AppHeader } from "./components/AppHeader";
import { CategorySidebar } from "./components/CategorySidebar";
import { LevelSwitcher } from "./components/LevelSwitcher";
import { PlaybackControls } from "./components/PlaybackControls";
import { ReaderCard } from "./components/ReaderCard";
import { UploadModal } from "./components/UploadModal";
import { useBukvarSettings } from "./hooks/useBukvarSettings";
import { useDictionary } from "./hooks/useDictionary";
import { getReaderScaleStyles } from "./hooks/useReaderScale";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { getActiveRewardMarker } from "./utils/dictionaryEntry";

export default function App() {
  const {
    activeCategory,
    level,
    readingSpeed,
    setActiveCategory,
    setReadingSpeed,
    showAccents,
    setShowAccents,
    switchLevel,
  } = useBukvarSettings();
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [isWordFinished, setIsWordFinished] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const resetPlaybackState = useCallback(() => {
    confetti.reset();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentSyllableIndex(0);
    setIsWordFinished(false);
  }, []);

  const { currentEntry, currentWordIndex, dictionary, loading, setCustomDictionary, setCurrentWordIndex } = useDictionary({
    activeCategory,
    level,
    onResetPlayback: resetPlaybackState,
  });
  const activeRewardMarker = getActiveRewardMarker(currentEntry, currentSyllableIndex, isWordFinished);
  const { cancelSpeech, speakEntry, speakText } = useSpeechSynthesis({
    readingSpeed,
    onPhraseEnd: () => setIsWordFinished(true),
    onPhraseReset: () => setIsWordFinished(false),
    onSyllableChange: setCurrentSyllableIndex,
  });

  const scaleStyles = getReaderScaleStyles(currentEntry.speechText.length, level);

  const nextAction = useCallback(() => {
    if (dictionary.length === 0 || currentEntry.syllables.length === 0) {
      return;
    }

    if (isWordFinished) {
      // Immediately stop all previous animations (confetti)
      confetti.reset();
      const nextIdx = (currentWordIndex + 1) % dictionary.length;
      setCurrentWordIndex(nextIdx);
      setCurrentSyllableIndex(0);
      setIsWordFinished(false);
    } else {
      if (currentSyllableIndex < currentEntry.syllables.length - 1) {
        setCurrentSyllableIndex(prev => prev + 1);
      } else {
        setIsWordFinished(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { 
            x: 0.2 + Math.random() * 0.6, // Random x between 0.2 and 0.8
            y: 0.4 + Math.random() * 0.3  // Random y between 0.4 and 0.7
          },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#2EC4B6'],
          ticks: 200,
          gravity: 1.2
        });
      }
    }
  }, [currentEntry.syllables.length, currentWordIndex, currentSyllableIndex, dictionary.length, isWordFinished]);

  const goToPreviousItem = useCallback(() => {
    if (dictionary.length === 0) return;
    resetPlaybackState();
    cancelSpeech();
    setCurrentWordIndex(prev => (prev - 1 + dictionary.length) % dictionary.length);
  }, [cancelSpeech, dictionary.length, resetPlaybackState]);

  const goToNextItem = useCallback(() => {
    if (dictionary.length === 0) return;
    resetPlaybackState();
    cancelSpeech();
    setCurrentWordIndex(prev => (prev + 1) % dictionary.length);
  }, [cancelSpeech, dictionary.length, resetPlaybackState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showUploadModal) return;

      if (e.code === "Space") {
        e.preventDefault();
        nextAction();
        return;
      }

      if (e.code === "ArrowLeft") {
        e.preventDefault();
        goToPreviousItem();
        return;
      }

      if (e.code === "ArrowRight") {
        e.preventDefault();
        goToNextItem();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextItem, goToPreviousItem, nextAction, showUploadModal]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length > 0) {
          setCustomDictionary(lines);
          setShowUploadModal(false);
          setActiveCategory('custom');
        }
      } catch (error) {
        alert("Не удалось прочитать файл.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen relative font-sans p-4 md:p-8 flex bg-[#FDFCF8]">
      <div className="absolute top-12 left-8 w-10 h-10 bg-natural-sage rounded-[0_100%_0_100%] opacity-20 -rotate-45" />
      <div className="absolute bottom-20 right-12 w-10 h-10 bg-natural-sage rounded-[0_100%_0_100%] opacity-20 rotate-[15deg]" />

      <CategorySidebar
        activeCategory={activeCategory}
        level={level}
        onOpenUpload={() => setShowUploadModal(true)}
        onSelectCategory={setActiveCategory}
        onSwitchLevel={switchLevel}
      />

      <div className="flex-1 min-h-0 flex flex-col items-center lg:items-start justify-start relative lg:pl-8">
        <div className="lg:hidden w-full max-w-6xl px-4">
          <LevelSwitcher level={level} onSwitch={switchLevel} mobile />
        </div>

        <AppHeader
          activeCategory={activeCategory}
          currentWordIndex={currentWordIndex}
          dictionaryLength={dictionary.length}
          level={level}
          loading={loading}
          readingSpeed={readingSpeed}
          showAccents={showAccents}
          onSetReadingSpeed={setReadingSpeed}
          onToggleAccents={() => setShowAccents(!showAccents)}
        />

        <main className="w-full max-w-6xl 2xl:max-w-none lg:flex-1 lg:min-h-0 flex flex-col items-center lg:items-start gap-10 md:gap-12 z-10 px-2 lg:px-0">
          <ReaderCard
            currentEntry={currentEntry}
            currentSyllableIndex={currentSyllableIndex}
            isWordFinished={isWordFinished}
            level={level}
            loading={loading}
            activeRewardMarker={activeRewardMarker}
            showAccents={showAccents}
            scaleStyles={scaleStyles}
            onAdvanceCurrentSyllable={nextAction}
            onSpeakPhrase={() => speakEntry(currentEntry)}
            onSpeakSyllable={(syllable) => speakText(syllable.speechText)}
          />

          <PlaybackControls
            dictionaryLength={dictionary.length}
            isWordFinished={isWordFinished}
            level={level}
            loading={loading}
            onNextItem={goToNextItem}
            onPreviousItem={goToPreviousItem}
            onPrimaryAction={nextAction}
          />
        </main>
      </div>

      {showUploadModal && (
        <UploadModal
          level={level}
          onClose={() => setShowUploadModal(false)}
          onFileUpload={handleFileUpload}
        />
      )}
    </div>
  );
}
