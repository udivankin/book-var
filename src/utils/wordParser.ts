
/**
 * Utility to parse words and sentences with syllable separators and stress markers.
 * Format: "ко-рО-ва", "мА-ма мО-ет рА-му"
 */

export function parseSyllablesWithAccent(input: string, showAccent: boolean = true): string[] {
    if (!input) return [];

    // Strategy: Split by spaces first to get words, then each word split by '-'
    const words = input.split(' ');
    const result: string[] = [];

    words.forEach((word, wordIdx) => {
        const syllables = word.split('-');
        syllables.forEach((syl) => {
            result.push(processAccent(syl, showAccent));
        });
        
        // Add space between words
        if (wordIdx < words.length - 1) {
            result.push(' ');
        }
    });

    return result;
}

/**
 * Replaces uppercase letters with lowercase + combining acute accent (\u0301) if showAccent is true.
 * Otherwise just returns lowercase.
 */
function processAccent(text: string, showAccent: boolean): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === char.toUpperCase() && char !== char.toLowerCase()) {
            result += char.toLowerCase() + (showAccent ? '\u0301' : '');
        } else {
            result += char;
        }
    }
    return result;
}
