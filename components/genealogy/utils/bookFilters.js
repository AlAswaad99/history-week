/**
 * Biblical book names and regex patterns for filtering by description/references.
 * Matches against: detail, amharic_detail, biblical_references (concatenated).
 */

// Canonical book names as they appear in references (e.g. "Genesis", "1 Chronicles")
export const BIBLICAL_BOOKS = [
  { id: 'genesis', label: 'Genesis', pattern: /\bGenesis\b/i },
  { id: 'exodus', label: 'Exodus', pattern: /\bExodus\b/i },
  { id: 'leviticus', label: 'Leviticus', pattern: /\bLeviticus\b/i },
  { id: 'numbers', label: 'Numbers', pattern: /\bNumbers\b/i },
  { id: 'deuteronomy', label: 'Deuteronomy', pattern: /\bDeuteronomy\b/i },
  { id: 'joshua', label: 'Joshua', pattern: /\bJoshua\b/i },
  { id: 'judges', label: 'Judges', pattern: /\bJudges\b/i },
  { id: 'ruth', label: 'Ruth', pattern: /\bRuth\b/i },
  { id: '1samuel', label: '1 Samuel', pattern: /\b1\s*Samuel\b/i },
  { id: '2samuel', label: '2 Samuel', pattern: /\b2\s*Samuel\b/i },
  { id: '1kings', label: '1 Kings', pattern: /\b1\s*Kings\b/i },
  { id: '2kings', label: '2 Kings', pattern: /\b2\s*Kings\b/i },
  { id: '1chronicles', label: '1 Chronicles', pattern: /\b1\s*Chronicles\b/i },
  { id: '2chronicles', label: '2 Chronicles', pattern: /\b2\s*Chronicles\b/i },
  { id: 'ezra', label: 'Ezra', pattern: /\bEzra\b/i },
  { id: 'nehemiah', label: 'Nehemiah', pattern: /\bNehemiah\b/i },
  { id: 'esther', label: 'Esther', pattern: /\bEsther\b/i },
  { id: 'job', label: 'Job', pattern: /\bJob\b/i },
  { id: 'psalm', label: 'Psalm', pattern: /\bPsalm(s)?\b/i },
  { id: 'proverbs', label: 'Proverbs', pattern: /\bProverbs\b/i },
  { id: 'ecclesiastes', label: 'Ecclesiastes', pattern: /\bEcclesiastes\b/i },
  { id: 'song', label: 'Song of Solomon', pattern: /\bSong\s*(of\s*Solomon)?\b/i },
  { id: 'isaiah', label: 'Isaiah', pattern: /\bIsaiah\b/i },
  { id: 'jeremiah', label: 'Jeremiah', pattern: /\bJeremiah\b/i },
  { id: 'lamentations', label: 'Lamentations', pattern: /\bLamentations\b/i },
  { id: 'ezekiel', label: 'Ezekiel', pattern: /\bEzekiel\b/i },
  { id: 'daniel', label: 'Daniel', pattern: /\bDaniel\b/i },
  { id: 'hosea', label: 'Hosea', pattern: /\bHosea\b/i },
  { id: 'joel', label: 'Joel', pattern: /\bJoel\b/i },
  { id: 'amos', label: 'Amos', pattern: /\bAmos\b/i },
  { id: 'obadiah', label: 'Obadiah', pattern: /\bObadiah\b/i },
  { id: 'jonah', label: 'Jonah', pattern: /\bJonah\b/i },
  { id: 'micah', label: 'Micah', pattern: /\bMicah\b/i },
  { id: 'nahum', label: 'Nahum', pattern: /\bNahum\b/i },
  { id: 'habakkuk', label: 'Habakkuk', pattern: /\bHabakkuk\b/i },
  { id: 'zephaniah', label: 'Zephaniah', pattern: /\bZephaniah\b/i },
  { id: 'haggai', label: 'Haggai', pattern: /\bHaggai\b/i },
  { id: 'zechariah', label: 'Zechariah', pattern: /\bZechariah\b/i },
  { id: 'malachi', label: 'Malachi', pattern: /\bMalachi\b/i },
  { id: 'matthew', label: 'Matthew', pattern: /\bMatthew\b/i },
  { id: 'mark', label: 'Mark', pattern: /\bMark\b/i },
  { id: 'luke', label: 'Luke', pattern: /\bLuke\b/i },
  { id: 'john', label: 'John', pattern: /\bJohn\b/i },
  { id: 'acts', label: 'Acts', pattern: /\bActs\b/i },
  { id: 'romans', label: 'Romans', pattern: /\bRomans\b/i },
  { id: '1corinthians', label: '1 Corinthians', pattern: /\b1\s*Corinthians\b/i },
  { id: '2corinthians', label: '2 Corinthians', pattern: /\b2\s*Corinthians\b/i },
  { id: 'galatians', label: 'Galatians', pattern: /\bGalatians\b/i },
  { id: 'ephesians', label: 'Ephesians', pattern: /\bEphesians\b/i },
  { id: 'philippians', label: 'Philippians', pattern: /\bPhilippians\b/i },
  { id: 'colossians', label: 'Colossians', pattern: /\bColossians\b/i },
  { id: '1thessalonians', label: '1 Thessalonians', pattern: /\b1\s*Thessalonians\b/i },
  { id: '2thessalonians', label: '2 Thessalonians', pattern: /\b2\s*Thessalonians\b/i },
  { id: '1timothy', label: '1 Timothy', pattern: /\b1\s*Timothy\b/i },
  { id: '2timothy', label: '2 Timothy', pattern: /\b2\s*Timothy\b/i },
  { id: 'titus', label: 'Titus', pattern: /\bTitus\b/i },
  { id: 'philemon', label: 'Philemon', pattern: /\bPhilemon\b/i },
  { id: 'hebrews', label: 'Hebrews', pattern: /\bHebrews\b/i },
  { id: 'james', label: 'James', pattern: /\bJames\b/i },
  { id: '1peter', label: '1 Peter', pattern: /\b1\s*Peter\b/i },
  { id: '2peter', label: '2 Peter', pattern: /\b2\s*Peter\b/i },
  { id: 'jude', label: 'Jude', pattern: /\bJude\b/i },
  { id: 'revelation', label: 'Revelation', pattern: /\bRevelation(s)?\b/i },
];

/** Torah = first 5 books (Genesis through Deuteronomy) */
export const TORAH_BOOK_IDS = ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'];

export const TORAH_OPTION = { id: 'torah', label: 'Torah (Genesis-Deuteronomy)', isTorah: true };

/**
 * Get combined regex for selected book IDs (multi-select).
 * If "torah" is in the list, include all five Torah book patterns.
 */
export function getBookRegex(selectedBookIds) {
  if (!selectedBookIds || selectedBookIds.length === 0) return null;
  const ids = new Set(selectedBookIds);
  const patterns = [];
  if (ids.has('torah')) {
    BIBLICAL_BOOKS.filter((b) => TORAH_BOOK_IDS.includes(b.id)).forEach((b) => patterns.push(b.pattern.source));
  }
  BIBLICAL_BOOKS.filter((b) => b.id !== 'torah' && ids.has(b.id)).forEach((b) => patterns.push(b.pattern.source));
  if (patterns.length === 0) return null;
  return new RegExp(patterns.join('|'), 'i');
}

/**
 * Check if person's description/references match the book regex.
 * Searches: detail, amharic_detail, biblical_references (and spouse for refs like "Genesis 3:20").
 */
export function personMatchesBookRegex(person, bookRegex) {
  if (!bookRegex) return true;
  const text = [person.detail, person.amharic_detail, person.biblical_references, person.spouse]
    .filter(Boolean)
    .join(' ');
  return bookRegex.test(text);
}
