import { Fragment, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RefreshCw, Volume2 } from "lucide-react";
import type { ActiveRewardMarker, ParsedDictionaryEntry, ParsedSyllable } from "../types/dictionary";
import type { Level, ScaleStyles } from "../types/app";

const SYLLABLE_COLORS = [
  "bg-[#A8C6D4] border-[#91ABB8]",
  "bg-[#8BA888] border-[#789376]",
  "bg-[#B07D62] border-[#966B53]",
];

type ReaderCardProps = {
  currentEntry: ParsedDictionaryEntry;
  currentSyllableIndex: number;
  isWordFinished: boolean;
  level: Level;
  loading: boolean;
  activeRewardMarker: ActiveRewardMarker | null;
  showAccents: boolean;
  scaleStyles: ScaleStyles;
  onAdvanceCurrentSyllable: () => void;
  onSpeakPhrase: () => void;
  onSpeakSyllable: (syllable: ParsedSyllable) => void;
};

type RewardMascotProps = {
  activeRewardMarker: ActiveRewardMarker | null;
};

function renderDisplayText(displayText: string): ReactNode {
  const glyphs: ReactNode[] = [];

  for (let i = 0; i < displayText.length; i += 1) {
    const char = displayText[i];
    const nextChar = displayText[i + 1];

    if (char === "\u0301") {
      continue;
    }

    if (nextChar === "\u0301") {
      glyphs.push(
        <span key={`${char}-${i}`} className="relative inline-block">
          <span>{char}</span>
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[0.28em] text-[1em] leading-none pointer-events-none"
          >
            &#769;
          </span>
        </span>,
      );
      i += 1;
      continue;
    }

    glyphs.push(<Fragment key={`${char}-${i}`}>{char}</Fragment>);
  }

  return glyphs;
}

function RewardMascot({ activeRewardMarker }: RewardMascotProps) {
  const rewardKey = activeRewardMarker?.key ?? "idle";
  const isSvgReward = activeRewardMarker?.kind === "svg";

  return (
    <div
      aria-hidden="true"
      className="hidden lg:block absolute bottom-2 right-2 xl:bottom-3 xl:right-3 w-[240px] h-[240px] pointer-events-none z-0"
    >
      <motion.div
        key={rewardKey}
        initial={activeRewardMarker ? { opacity: 0.92, scale: 0.88, y: 20, rotate: -8 } : { opacity: 1, scale: 1 }}
        animate={
          activeRewardMarker
            ? {
                opacity: 1,
                scale: [0.88, 1.06, 1],
                y: [20, -10, 0],
                rotate: [-8, 5, 0],
              }
            : {
                opacity: 1,
                scale: 1,
                y: 0,
                rotate: 0,
              }
        }
        transition={
          activeRewardMarker
            ? {
                duration: 0.48,
                ease: [0.16, 1, 0.3, 1],
                times: [0, 0.65, 1],
              }
            : { duration: 0.18, ease: "easeOut" }
        }
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-[200px] h-[200px]">
          <AnimatePresence initial={false}>
            {activeRewardMarker && (
              <motion.div
                key={`${activeRewardMarker.key}-glow`}
                initial={{ opacity: 0, scale: 0.45 }}
                animate={{ opacity: [0, 0.75, 0.3], scale: [0.45, 1.08, 1] }}
                className="absolute inset-5 rounded-full bg-[#FFF4D6] blur-2xl"
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          <svg viewBox="0 0 200 200" width="200" height="200" className="absolute inset-0 z-10 drop-shadow-lg">
            <circle cx="100" cy="100" r="80" fill="#D4A373" />
            <path d="M40 60 Q20 20 60 40" fill="#B07D62" />
            <path d="M160 60 Q180 20 140 40" fill="#B07D62" />
          </svg>

          <AnimatePresence initial={false} mode="popLayout">
            {activeRewardMarker ? (
              <motion.div
                key={activeRewardMarker.key}
                initial={{ opacity: 0, scale: 0.35, y: 14, rotate: -18 }}
                animate={{
                  opacity: [0, 1, 1],
                  scale: [0.35, 1.18, 1],
                  y: [14, -12, 0],
                  rotate: [-18, 10, 0],
                }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{
                  duration: 0.42,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.7, 1],
                }}
                className="absolute inset-0 z-20 flex items-center justify-center text-[104px] leading-none"
              >
                {isSvgReward ? (
                  <img
                    aria-hidden="true"
                    src={activeRewardMarker.src}
                    alt=""
                    className="h-[120px] w-[120px] object-contain drop-shadow-lg"
                    draggable={false}
                  />
                ) : (
                  <span aria-hidden="true">{activeRewardMarker.value}</span>
                )}
              </motion.div>
            ) : (
              <motion.svg
                key="mascot-face"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                viewBox="0 0 200 200"
                width="200"
                height="200"
                className="absolute inset-0 z-20"
              >
                <circle cx="70" cy="80" r="10" fill="#FFF" />
                <circle cx="130" cy="80" r="10" fill="#FFF" />
                <circle cx="72" cy="82" r="4" fill="#000" />
                <circle cx="132" cy="82" r="4" fill="#000" />
                <path d="M80 130 Q100 150 120 130" stroke="#FFF" strokeWidth="6" fill="none" strokeLinecap="round" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export function ReaderCard({
  currentEntry,
  currentSyllableIndex,
  isWordFinished,
  level,
  loading,
  activeRewardMarker,
  showAccents,
  scaleStyles,
  onAdvanceCurrentSyllable,
  onSpeakPhrase,
  onSpeakSyllable,
}: ReaderCardProps) {
  return (
    <div className="relative w-full min-h-[450px] md:min-h-[550px] lg:min-h-[650px] lg:flex-1 flex flex-col items-center justify-center bg-white rounded-[40px] md:rounded-[60px] shadow-[0_20px_0_#E5E1D3] border-8 border-white p-4">
      {loading ? (
        <div className="relative z-10 flex flex-col items-center gap-4 text-natural-sage">
          <RefreshCw className="w-12 h-12 animate-spin" />
          <span className="font-bold uppercase tracking-widest">Загружаем...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${level}-${currentEntry.rawText}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className={`relative z-10 flex flex-wrap justify-center px-4 md:px-12 w-full max-h-full overflow-y-auto custom-scrollbar py-6 ${scaleStyles.container}`}
          >
            {currentEntry.nodes.map((node, nodeIndex) => {
              if (node.type === "space") {
                return <div key={`space-${nodeIndex}`} className="w-2 md:w-6" />;
              }

              if (node.type === "symbol") {
                const displayText = showAccents ? node.textWithAccent : node.textWithoutAccent;

                return (
                  <div
                    key={`symbol-${nodeIndex}-${node.rawText}`}
                    className="flex flex-nowrap items-center relative px-1 md:px-2 text-[#B8B3A6]"
                    style={scaleStyles.fontSize ? { fontSize: scaleStyles.fontSize } : {}}
                  >
                    <span
                      className={
                        scaleStyles.fontSize
                          ? "font-black leading-none"
                          : `${level === "words" ? "text-4xl md:text-[100px] lg:text-[130px]" : "text-xl md:text-[32px] lg:text-[42px]"} font-black leading-none`
                      }
                    >
                      {renderDisplayText(displayText)}
                    </span>
                  </div>
                );
              }

              return (
                <div key={`word-${node.index}`} className="flex flex-nowrap gap-x-2 md:gap-x-4 items-center relative">
                  {node.syllables.map((syllable, itemIndex) => {
                    const isActive = syllable.index === currentSyllableIndex && !isWordFinished;
                    const isRead = syllable.index < currentSyllableIndex || isWordFinished;
                    const colorClass = SYLLABLE_COLORS[syllable.index % SYLLABLE_COLORS.length];
                    const isLastInWord = itemIndex === node.syllables.length - 1;
                    const displayText = showAccents ? syllable.textWithAccent : syllable.textWithoutAccent;

                    return (
                      <Fragment key={`${currentEntry.rawText}-${syllable.index}`}>
                        <motion.div
                          onClick={() => {
                            onSpeakSyllable(syllable);
                            if (syllable.index === currentSyllableIndex) {
                              onAdvanceCurrentSyllable();
                            }
                          }}
                          animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                          transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
                          className={`relative z-10 flex-shrink-0 transition-all duration-300 cursor-pointer select-none ${scaleStyles.padding} rounded-xl md:rounded-[30px] border-b-4 md:border-b-[8px] ${
                            isRead || isActive
                              ? `${colorClass} text-white`
                              : "bg-[#F4F1E8] border-[#D1CEC4] text-[#D1CEC4] opacity-50"
                          } ${isActive ? "shadow-xl -translate-y-1 md:-translate-y-2" : ""}`}
                          style={scaleStyles.fontSize ? { fontSize: scaleStyles.fontSize } : {}}
                        >
                          <span
                            className={
                              scaleStyles.fontSize
                                ? "font-black leading-none"
                                : `${level === "words" ? "text-4xl md:text-[100px] lg:text-[130px]" : "text-xl md:text-[32px] lg:text-[42px]"} font-black leading-none`
                            }
                          >
                            {renderDisplayText(displayText)}
                          </span>
                        </motion.div>

                        {!isLastInWord && (
                          <div
                            className={`h-0.5 md:h-1 w-2 md:w-4 -mx-1 md:-mx-2 self-center transition-colors duration-300 ${isRead ? "bg-[#D4A373]" : "bg-[#E5E1D3]"}`}
                            style={{ marginTop: "-4px" }}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="relative z-10 mt-8 flex items-center gap-4 text-gray-400 text-lg md:text-2xl italic font-medium">
        <span className="text-4xl md:text-5xl not-italic select-none">📖</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onSpeakPhrase}
            className="p-1.5 bg-white shadow-sm border-2 border-[#E5E1D3] hover:border-natural-sage rounded-full transition-all group active:scale-95"
            title="Озвучить целиком"
          >
            <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-gray-300 group-hover:text-natural-sage transition-colors" />
          </button>
        </div>
      </div>

      <RewardMascot activeRewardMarker={activeRewardMarker} />
    </div>
  );
}
