
export const VOWELS = 'аоуиыэеёюя';

/**
 * Splits a Russian word into syllables for educational purposes.
 * This follows basic school rules: each syllable has one vowel.
 */
export function splitIntoSyllables(word: string): string[] {
  if (!word) return [];
  const lowercaseWord = word.toLowerCase();
  const syllables: string[] = [];
  let currentSyllable = '';
  
  const isVowel = (char: string) => VOWELS.includes(char.toLowerCase());

  // Count vowels first
  const vowelIndices: number[] = [];
  for (let i = 0; i < lowercaseWord.length; i++) {
    if (isVowel(lowercaseWord[i])) {
      vowelIndices.push(i);
    }
  }

  if (vowelIndices.length === 0) return [word];

  let lastSplitIndex = 0;

  for (let i = 0; i < vowelIndices.length; i++) {
    const nextVowelIndex = vowelIndices[i + 1];
    
    if (nextVowelIndex === undefined) {
      // Last syllable: take everything else
      syllables.push(word.slice(lastSplitIndex));
    } else {
      // Find a split point between two vowels
      // Usually after the first vowel, or after one consonant if any
      const consonantsInBetween = nextVowelIndex - vowelIndices[i] - 1;
      let splitPoint;

      if (consonantsInBetween === 0) {
        // Two vowels together: split between them (e.g., а-у)
        splitPoint = vowelIndices[i] + 1;
      } else if (consonantsInBetween === 1) {
        // One consonant: usually goes to the next syllable (e.g., ма-ма)
        splitPoint = vowelIndices[i] + 1;
      } else {
        // Multiple consonants: rule of thumb is to split after the first one 
        // if it's 'й', 'ь', 'ъ' or if it's the "sonor" liquid consonant.
        // For simplicity in kids app: split after first consonant.
        const firstConsonantIndex = vowelIndices[i] + 1;
        const firstConsonant = lowercaseWord[firstConsonantIndex];
        
        if (['й', 'ь', 'ъ'].includes(firstConsonant)) {
            splitPoint = firstConsonantIndex + 1;
        } else {
            // Standard school split: split before the last consonant in the cluster if cluster > 1?
            // Actually "ка-пус-та" is common. 
            // Let's use: if 1 consonant, goes to next. If > 1, split after first.
            splitPoint = vowelIndices[i] + 2; 
        }
      }
      
      syllables.push(word.slice(lastSplitIndex, splitPoint));
      lastSplitIndex = splitPoint;
    }
  }

  return syllables;
}
