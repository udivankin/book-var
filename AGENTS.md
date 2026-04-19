# Agent Instructions (AGENTS.md)

This document contains project-specific rules, patterns, and context for AI agents working on this application.

## 🎯 Project Vision
A child-friendly, minimalist, and highly accessible online primer ("Bukvar") for learning to read Russian by syllables.

## 🛠 Tech Stack
- **Framework**: React 18+ with Vite.
- **Styling**: Tailwind CSS (Strictly utility-only, no custom CSS files).
- **Icons**: Lucide React.
- **Animations**: Framer Motion (`motion/react`).
- **Celebration**: `canvas-confetti`.

## 🎨 Design System
- **Tone**: Calm, organic, natural, encouraging.
- **Colors**:
  - `natural-sage` (#8BA888): Primary successes, words level.
  - `natural-ochre` (#D4A373): Sentences level, accents.
  - `natural-clay` (#B07D62): Secondary accents (Mascot).
  - Background: `#FDFCF8` (Soft paper-white).
- **Typography**: Sans-serif, extra-bold weight for readability. No serifs for the main reading area.

## 🧩 Core Logic Patterns
### Syllable Parsing
- Data files in `public/data/**/*.txt` are simple line-separated lists.
- Syllables are expected to be separated by `-` in the string (e.g., `не-бо`).
- Accents are represented by the `\u0301` combining character.

### TTS & Highlighting (Karaoke Logic)
- The application uses `window.speechSynthesis`.
- **Timing Invariant**: The visual highlight must "sweep" slightly ahead of the audio to guide the eye. 
- **Synchronization**: `utterance.onboundary` maps speech char indices to syllable indices.
- **Auto-Finish**: `utterance.onend` must explicitly set the last syllable as finished and clear any pending timers.

### Navigation
- **Space bar** is the primary interaction method. Use `useCallback` and `useEffect` with visibility guards to ensure it always responds to `nextAction`.
- The `isWordFinished` state should block consecutive syllable increments and instead trigger moving to the next dictionary item.

### Asset Management
- Avoid massive image imports. Prefer SVGs (like the Mascot) or high-quality CDN URLs.

## ⚠️ Anti-Patterns (Avoid)
- **Do not enable Service Workers**: Aggressive caching in `sw.js` was removed to prevent users from being trapped on old versions. Stick to standard browser cache.
- **No Overlays**: Avoid large, opaque overlays (like the old "Hooray!" window) that hide the content the user just read. Prefer background celebrations like confetti.
- **No fixed pixel heights**: Use `min-h-screen` and flex layouts.

## 🔄 Persistence
- User progress (index), level preference, and accent visibility must be synced with `localStorage`.
