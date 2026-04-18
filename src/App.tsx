/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, ChangeEvent, Fragment } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Upload, RefreshCw, Trash2, Tag, Type, Volume2 } from "lucide-react";
import { parseSyllablesWithAccent } from "./utils/wordParser";

type Level = 'words' | 'sentences';

const CATEGORIES = {
  words: [
    { id: 'first_words', name: '🌟 Первые слова', file: 'data/words/first_words.txt' },
    { id: 'animals', name: '🦁 Животные', file: 'data/words/animals.txt' },
    { id: 'food', name: '🍎 Еда', file: 'data/words/food.txt' },
    { id: 'colors', name: '🎨 Цвета', file: 'data/words/colors.txt' },
    { id: 'transport', name: '🚗 Транспорт', file: 'data/words/transport.txt' },
    { id: 'nature', name: '🌳 Природа', file: 'data/words/nature.txt' },
    { id: 'home', name: '🏠 Дом', file: 'data/words/home.txt' },
    { id: 'toys', name: '🧸 Игрушки', file: 'data/words/toys.txt' },
    { id: 'red', name: '🍎 Красное', file: 'data/words/red.txt' },
    { id: 'fast', name: '🚀 Быстрое', file: 'data/words/fast.txt' },
  ],
  sentences: [
    { id: 'basics', name: '📖 Первые фразы', file: 'data/sentences/basics.txt' },
    { id: 'family', name: '👨‍👩‍👧 Семья', file: 'data/sentences/family.txt' },
    { id: 'actions', name: '🏃 Действия', file: 'data/sentences/actions.txt' },
    { id: 'weather', name: '🌈 Погода', file: 'data/sentences/weather.txt' },
    { id: 'polite', name: '🤝 Вежливость', file: 'data/sentences/polite.txt' },
    { id: 'daily', name: '⏰ Режим дня', file: 'data/sentences/daily.txt' },
    { id: 'emotions', name: '😊 Эмоции', file: 'data/sentences/emotions.txt' },
    { id: 'play', name: '🧩 Игры', file: 'data/sentences/play.txt' },
    { id: 'shapes', name: '🔴 Цвета и формы', file: 'data/sentences/shapes.txt' },
    { id: 'animals_sentences', name: '🐱 Про зверей', file: 'data/sentences/animals.txt' },
  ]
};

export default function App() {
  const [level, setLevel] = useState<Level>(() => {
    return (localStorage.getItem('bukvar-level') as Level) || 'words';
  });
  
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    const savedLevel = localStorage.getItem('bukvar-level') || 'words';
    return localStorage.getItem(`bukvar-category-${savedLevel}`) || CATEGORIES[savedLevel as Level][0].id;
  });

  const [dictionary, setDictionary] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccents, setShowAccents] = useState<boolean>(() => {
    return localStorage.getItem('bukvar-accents') === 'true';
  });
  
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [isWordFinished, setIsWordFinished] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const speak = (text: string, isWholePhrase: boolean = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // For natural speech, we MUST remove hyphens. 
      // "ма-ши-на" -> "машина" (sounds natural)
      const speechText = text.toLowerCase().replace(/\u0301/g, '').replace(/-/g, '');
      const utterance = new SpeechSynthesisUtterance(speechText);
      
      const voices = window.speechSynthesis.getVoices();
      const russianVoice = voices.find(v => v.lang.includes('ru') || v.lang.includes('RU')) 
                        || voices.find(v => v.name.toLowerCase().includes('russian'));
      
      if (russianVoice) utterance.voice = russianVoice;
      
      utterance.lang = 'ru-RU';
      utterance.rate = 0.85; // Natural but slightly slower for clarity
      utterance.pitch = 1.0; 
      
      if (isWholePhrase) {
        // We need to map syllables to words for interpolation
        const words = text.split(' ');
        let currentSyllableIdx = 0;
        const wordSyllableMap: { wordStart: number; syllables: number[] }[] = [];
        
        let cumulativeSpeechPos = 0;
        words.forEach(word => {
          const cleanWord = word.replace(/-/g, '').toLowerCase().replace(/\u0301/g, '');
          if (!cleanWord) return;
          
          const syllableCount = word.split('-').length;
          const syllableIndices = [];
          for (let i = 0; i < syllableCount; i++) {
            syllableIndices.push(currentSyllableIdx++);
          }
          
          wordSyllableMap.push({
            wordStart: cumulativeSpeechPos,
            syllables: syllableIndices
          });
          
          cumulativeSpeechPos += cleanWord.length + 1; // +1 for space
        });

        let syllableTimer: ReturnType<typeof setTimeout> | null = null;

        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            if (syllableTimer) clearTimeout(syllableTimer);
            
            const mapping = wordSyllableMap.find(m => m.wordStart === event.charIndex) ||
                            wordSyllableMap.reduce((prev, curr) => (curr.wordStart <= event.charIndex ? curr : prev));
            
            if (mapping) {
              // Highlight first syllable of the word immediately
              setCurrentSyllableIndex(mapping.syllables[0]);
              setIsWordFinished(false);
              
              // If word has multiple syllables, interpolate the rest
              if (mapping.syllables.length > 1) {
                const syllablesInWord = mapping.syllables.length;
                // Estimate word duration based on character count and speech rate.
                // We use a much smaller constant (50) so the visual highlight "sweeps" 
                // slightly ahead of the audio. This ensures all syllables are highlighted
                // before the word's audio physically ends (which would cut the timer).
                const chars = words[wordSyllableMap.indexOf(mapping)].replace(/-/g, '').length;
                const totalWordTime = (chars * 50) / (utterance.rate); 
                const timePerSyllable = totalWordTime / syllablesInWord;

                let currentInWord = 1;
                const nextSyllable = () => {
                   if (currentInWord < syllablesInWord) {
                     setCurrentSyllableIndex(mapping.syllables[currentInWord]);
                     currentInWord++;
                     syllableTimer = setTimeout(nextSyllable, timePerSyllable);
                   }
                };
                syllableTimer = setTimeout(nextSyllable, timePerSyllable);
              }
            }
          }
        };

        utterance.onend = () => {
          if (syllableTimer) clearTimeout(syllableTimer);
          
          // Ensure the very last syllable is marked as active before resetting
          setCurrentSyllableIndex(allSyllables.length - 1);
          setIsWordFinished(true);
          
          setTimeout(() => {
            setCurrentSyllableIndex(0);
            setIsWordFinished(false);
          }, 800);
        };
      }
      
      utterance.onstart = () => console.log('Speech started (Natural):', speechText);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        console.log('Voices loaded/changed:', voices.length);
      }
    };
    
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('bukvar-level', level);
  }, [level]);

  useEffect(() => {
    localStorage.setItem(`bukvar-category-${level}`, activeCategory);
  }, [level, activeCategory]);

  useEffect(() => {
    localStorage.setItem('bukvar-accents', String(showAccents));
  }, [showAccents]);

  useEffect(() => {
    if (dictionary.length > 0 && activeCategory !== 'custom') {
      localStorage.setItem(`bukvar-progress-${level}-${activeCategory}`, String(currentWordIndex));
    }
  }, [currentWordIndex, level, activeCategory, dictionary.length]);

  // Load data for the current level and category
  useEffect(() => {
    const category = CATEGORIES[level].find(c => c.id === activeCategory) || CATEGORIES[level][0];
    
    setLoading(true);
    fetch(category.file)
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        setDictionary(lines);
        
        // Load progress for this specific level+category
        const savedProgress = localStorage.getItem(`bukvar-progress-${level}-${activeCategory}`);
        const index = savedProgress ? parseInt(savedProgress, 10) : 0;
        
        setCurrentWordIndex(index < lines.length ? index : 0);
        setCurrentSyllableIndex(0);
        setIsWordFinished(false);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load category:", err);
        setLoading(false);
      });
  }, [level, activeCategory]);

  const currentItem = dictionary[currentWordIndex] || "";
  const allSyllables = parseSyllablesWithAccent(currentItem, showAccents);

  // Calculate dynamic scale based on total characters in the current item
  const getScaleStyles = () => {
    const rawText = allSyllables.join('').replace(/\u0301/g, ''); // Count real letters
    const charCount = rawText.length;
    
    if (level === 'words') {
      // Base: text-[100px] / 4xl (36px)
      // If word is longer than 6 chars, start shrinking
      if (charCount > 6) {
        const factor = Math.max(0.4, 6 / charCount);
        return {
          container: level === 'words' ? 'gap-2 md:gap-6' : 'gap-x-2 gap-y-3 md:gap-x-4 md:gap-y-4',
          fontSize: `clamp(1.5rem, ${4 * factor}vw, ${100 * factor}px)`,
          padding: charCount > 10 ? 'px-2 py-1 md:px-4 md:py-3' : 'px-4 py-3 md:px-8 md:py-6'
        };
      }
      return {
        container: 'gap-4 md:gap-12 lg:gap-16',
        fontSize: '', // Use classes
        padding: 'px-4 py-3 md:px-8 md:py-6 lg:px-12 lg:py-8'
      };
    } else {
      // Sentences: Base text-[32px] / xl (20px)
      // If sentence is longer than 25 chars, start shrinking
      if (charCount > 25) {
        const factor = Math.max(0.5, 25 / charCount);
        return {
          container: 'gap-x-2 gap-y-3 md:gap-x-4 md:gap-y-4',
          fontSize: `clamp(0.875rem, ${2 * factor}vw, ${32 * factor}px)`,
          padding: 'px-2 py-1.5 md:px-4 md:py-2'
        };
      }
      return {
        container: 'gap-x-4 gap-y-6 md:gap-x-8 md:gap-y-8 lg:gap-x-12 lg:gap-y-10',
        fontSize: '', // Use classes
        padding: 'px-2 py-1.5 md:px-5 md:py-3 lg:px-8 lg:py-5'
      };
    }
  };

  const scaleStyles = getScaleStyles();

  const nextAction = useCallback(() => {
    if (isWordFinished) {
      const nextIdx = (currentWordIndex + 1) % dictionary.length;
      setCurrentWordIndex(nextIdx);
      setCurrentSyllableIndex(0);
      setIsWordFinished(false);
    } else {
      if (currentSyllableIndex < allSyllables.length - 1) {
        setCurrentSyllableIndex(prev => prev + 1);
      } else {
        setIsWordFinished(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#2EC4B6']
        });
      }
    }
  }, [currentWordIndex, currentSyllableIndex, isWordFinished, allSyllables.length, dictionary.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        nextAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextAction]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length > 0) {
          setDictionary(lines);
          setCurrentWordIndex(0);
          setCurrentSyllableIndex(0);
          setIsWordFinished(false);
          setShowUploadModal(false);
          setActiveCategory('custom');
        }
      } catch (error) {
        alert("Не удалось прочитать файл.");
      }
    };
    reader.readAsText(file);
  };

  const switchLevel = (newLevel: Level) => {
    if (newLevel !== level) {
      setLevel(newLevel);
      const savedCat = localStorage.getItem(`bukvar-category-${newLevel}`);
      setActiveCategory(savedCat || CATEGORIES[newLevel][0].id);
    }
  };

  const SYLLABLE_COLORS = [
    'bg-[#A8C6D4] border-[#91ABB8]', // Sky
    'bg-[#8BA888] border-[#789376]', // Sage
    'bg-[#B07D62] border-[#966B53]', // Clay
  ];

  return (
    <div className="min-h-screen relative font-sans p-4 md:p-8 flex bg-[#FDFCF8]">
      {/* Decorative Elements */}
      <div className="absolute top-12 left-8 w-10 h-10 bg-natural-sage rounded-[0_100%_0_100%] opacity-20 -rotate-45" />
      <div className="absolute bottom-20 right-12 w-10 h-10 bg-natural-sage rounded-[0_100%_0_100%] opacity-20 rotate-[15deg]" />

      {/* Sidebar - Category Cloud */}
      <aside className="hidden lg:flex flex-col w-64 pr-8 z-20 sticky top-8 h-fit">
        {/* Sidebar Level Switcher */}
        <div className="flex bg-white/50 backdrop-blur p-1 rounded-2xl border-4 border-[#E5E1D3] shadow-inner mb-6">
          <button 
            onClick={() => switchLevel('words')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${level === 'words' ? 'bg-natural-sage text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            СЛОВА
          </button>
          <button 
            onClick={() => switchLevel('sentences')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${level === 'sentences' ? 'bg-natural-ochre text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ФРАЗЫ
          </button>
        </div>

        <div className="bg-white/50 backdrop-blur rounded-[32px] p-6 border-4 border-[#E5E1D3] shadow-inner">
          <div className="flex items-center gap-2 mb-6 text-natural-sage">
            <Tag className="w-5 h-5" />
            <h3 className="font-black uppercase tracking-widest text-sm">Категории</h3>
          </div>
          
          <div className="flex flex-col gap-2">
            {CATEGORIES[level].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  text-left px-4 py-2 rounded-xl font-bold transition-all text-sm
                  ${activeCategory === cat.id 
                    ? 'bg-natural-sage text-white shadow-md -translate-x-1' 
                    : 'text-gray-400 hover:text-natural-sage hover:bg-white'}
                `}
              >
                {cat.name}
              </button>
            ))}
            
            <div className="mt-2 pt-2 border-t-2 border-[#E5E1D3] border-dashed">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full text-left px-4 py-2 rounded-xl font-bold text-xs text-natural-ochre hover:bg-white transition-all flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                Свой список
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col items-center lg:items-start justify-start relative lg:pl-8">
        {/* Mobile Level Switcher */}
        <div className="lg:hidden w-full max-w-6xl px-4">
          <div className="flex bg-white shadow-sm p-1 rounded-xl border-2 border-[#E5E1D3]">
            <button 
              onClick={() => switchLevel('words')}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${level === 'words' ? 'bg-natural-sage text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              СЛОВА
            </button>
            <button 
              onClick={() => switchLevel('sentences')}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${level === 'sentences' ? 'bg-natural-ochre text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ПРЕДЛОЖЕНИЯ
            </button>
          </div>
        </div>

        {/* Header */}
        <header className="w-full max-w-6xl flex justify-between items-center mb-10 px-4 lg:px-0 z-10">
          <div className="flex flex-col gap-1 items-start">
            <h1 className="text-2xl md:text-3xl font-[800] tracking-[2px] text-natural-sage uppercase">
              Букварь Онлайн
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-natural-ochre uppercase tracking-widest bg-natural-ochre/10 px-2 py-0.5 rounded-full">
                {CATEGORIES[level].find(c => c.id === activeCategory)?.name || 'Пользовательский'}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {dictionary.length - currentWordIndex} осталось
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowAccents(!showAccents)}
              className={`p-2.5 bg-white border-b-4 border-[#D1CEC4] hover:translate-y-[1px] hover:border-b-2 active:translate-y-[4px] active:border-b-0 rounded-xl transition-all ${showAccents ? 'text-natural-ochre' : 'text-gray-300'}`}
              title={showAccents ? "Убрать ударения" : "Показать ударения"}
            >
              <Type className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Game Area */}
        <main className="w-full max-w-6xl flex flex-col items-center lg:items-start gap-10 md:gap-12 z-10 px-2 lg:px-0">
          <div className="relative w-full min-h-[450px] md:min-h-[550px] lg:min-h-[650px] flex flex-col items-center justify-center bg-white rounded-[40px] md:rounded-[60px] shadow-[0_20px_0_#E5E1D3] border-8 border-white p-4">
            
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-natural-sage">
                 <RefreshCw className="w-12 h-12 animate-spin" />
                 <span className="font-bold uppercase tracking-widest">Загружаем...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${level}-${currentItem}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  className={`flex flex-wrap justify-center px-4 md:px-12 w-full max-h-full overflow-y-auto custom-scrollbar py-6 ${scaleStyles.container}`}
                >
                  {(() => {
                    const groupedSyllables: Array<{ type: 'word' | 'space', items: Array<{ syllable: string, globalIdx: number }> }> = [];
                    let currentWordGroup: Array<{ syllable: string, globalIdx: number }> = [];

                    allSyllables.forEach((syl, idx) => {
                      if (syl === ' ') {
                        if (currentWordGroup.length > 0) {
                          groupedSyllables.push({ type: 'word', items: currentWordGroup });
                          currentWordGroup = [];
                        }
                        groupedSyllables.push({ type: 'space', items: [{ syllable: ' ', globalIdx: idx }] });
                      } else {
                        currentWordGroup.push({ syllable: syl, globalIdx: idx });
                      }
                    });
                    if (currentWordGroup.length > 0) {
                      groupedSyllables.push({ type: 'word', items: currentWordGroup });
                    }

                    return groupedSyllables.map((group, gIdx) => {
                      if (group.type === 'space') {
                        return <div key={`space-${gIdx}`} className="w-2 md:w-6" />;
                      }

                      return (
                        <div key={`word-${gIdx}`} className="flex flex-nowrap gap-x-2 md:gap-x-4 items-center relative">
                          {group.items.map(({ syllable, globalIdx }, itemIdx) => {
                            const isActive = globalIdx === currentSyllableIndex && !isWordFinished;
                            const isRead = globalIdx < currentSyllableIndex || isWordFinished;
                            const colorClass = SYLLABLE_COLORS[globalIdx % SYLLABLE_COLORS.length];
                            const isLastInWord = itemIdx === group.items.length - 1;

                            return (
                              <Fragment key={`${currentItem}-${globalIdx}`}>
                                <motion.div
                                  onClick={() => {
                                      speak(syllable);
                                      if (globalIdx === currentSyllableIndex) nextAction();
                                  }}
                                  animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                  transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
                                  className={`
                                    relative z-10 flex-shrink-0 transition-all duration-300 cursor-pointer select-none 
                                    ${scaleStyles.padding} 
                                    rounded-xl md:rounded-[30px] border-b-4 md:border-b-[8px]
                                    ${isRead || isActive 
                                      ? `${colorClass} text-white` 
                                      : 'bg-[#F4F1E8] border-[#D1CEC4] text-[#D1CEC4] opacity-50'}
                                    ${isActive ? 'shadow-xl -translate-y-1 md:-translate-y-2' : ''}
                                  `}
                                  style={scaleStyles.fontSize ? { fontSize: scaleStyles.fontSize } : {}}
                                >
                                  <span className={scaleStyles.fontSize ? 'font-black uppercase leading-none' : `${level === 'words' ? 'text-4xl md:text-[100px] lg:text-[130px]' : 'text-xl md:text-[32px] lg:text-[42px]'} font-black uppercase leading-none`}>
                                    {syllable}
                                  </span>
                                </motion.div>
                                
                                {!isLastInWord && (
                                  <div 
                                    className={`h-0.5 md:h-1 w-2 md:w-4 -mx-1 md:-mx-2 self-center transition-colors duration-300 ${isRead ? 'bg-[#D4A373]' : 'bg-[#E5E1D3]'}`} 
                                    style={{ marginTop: '-4px' }}
                                  />
                                )}
                              </Fragment>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Info Display */}
            <div className="mt-8 flex items-center gap-4 text-gray-400 text-lg md:text-2xl italic font-medium">
               <span className="text-4xl md:text-5xl not-italic">📖</span>
               <div className="flex items-center gap-3">
                 <span className="uppercase tracking-[2px]">
                   {level === 'words' ? 'Слово' : 'Предложение'}
                 </span>
                 <button
                   onClick={() => speak(dictionary[currentWordIndex], true)}
                   className="p-1.5 bg-white shadow-sm border-2 border-[#E5E1D3] hover:border-natural-sage rounded-full transition-all group active:scale-95"
                   title="Озвучить целиком"
                 >
                   <Volume2 className="w-6 h-6 md:w-8 h-8 text-gray-300 group-hover:text-natural-sage transition-colors" />
                 </button>
               </div>
            </div>

            {/* Mascot SVG */}
            <div className="hidden lg:block absolute -bottom-10 -right-20 w-[240px] h-[240px]">
              <svg viewBox="0 0 200 200" width="200" height="200" className="drop-shadow-lg">
                  <circle cx="100" cy="100" r="80" fill="#D4A373" />
                  <circle cx="70" cy="80" r="10" fill="#FFF" />
                  <circle cx="130" cy="80" r="10" fill="#FFF" />
                  <circle cx="72" cy="82" r="4" fill="#000" />
                  <circle cx="132" cy="82" r="4" fill="#000" />
                  <path d="M80 130 Q100 150 120 130" stroke="#FFF" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <path d="M40 60 Q20 20 60 40" fill="#B07D62" />
                  <path d="M160 60 Q180 20 140 40" fill="#B07D62" />
              </svg>
            </div>
          </div>

          {/* Footer Hints */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="bg-white px-8 py-5 md:px-12 md:py-6 rounded-[24px] border-b-6 border-[#D1CEC4] flex items-center gap-4 text-lg md:text-xl font-[800]">
              <div className="w-12 h-3 border-2 border-natural-text rounded-full" />
              <span>ПРОБЕЛ — ДАЛЬШЕ</span>
            </div>
            
            <button
              onClick={nextAction}
              disabled={loading}
              className={`disabled:opacity-50 px-10 py-5 md:px-16 md:py-6 text-white font-[800] text-lg md:text-xl rounded-[24px] border-b-6 hover:translate-y-[2px] hover:border-b-4 active:translate-y-[6px] active:border-b-0 transition-all shadow-lg ${level === 'words' ? 'bg-natural-sage border-[#5D705B]' : 'bg-natural-ochre border-[#A67E56]'}`}
            >
              {isWordFinished ? "СЛЕДУЮЩЕЕ" : "ЧИТАТЬ"}
            </button>
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Trash2 className="w-5 h-5 text-gray-400" />
            </button>

            <h2 className="text-2xl font-black mb-4">Твой словарь ({level === 'words' ? 'Слова' : 'Предложения'})</h2>
            <p className="text-gray-500 mb-6 font-medium">
              Загрузи файл .txt, где слоги разделены минусом, а ударение - большая буква (напр. ко-рО-ва).
            </p>

            <div className="flex flex-col gap-4">
               <label className="flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-[#E1EEFF] rounded-2xl cursor-pointer hover:bg-[#F0F7FF] transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-natural-sage mb-3" />
                    <p className="text-sm font-bold text-gray-600">Нажми чтобы выбрать файл</p>
                  </div>
                  <input type="file" className="hidden" accept=".txt,.json" onChange={handleFileUpload} />
               </label>
               
               <button 
                 onClick={() => setShowUploadModal(false)}
                 className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-xl active:scale-[0.98] transition-all"
               >
                 Отмена
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
