export type EmojiRewardMarker = {
  kind: "emoji";
  value: string;
  revealAfterSyllableIndex: number;
};

export type SvgRewardMarker = {
  kind: "svg";
  fileName: string;
  src: string;
  revealAfterSyllableIndex: number;
};

export type RewardMarker = EmojiRewardMarker | SvgRewardMarker;

export type ActiveRewardMarker = RewardMarker & {
  key: string;
};

export type ParsedSyllable = {
  type: "syllable";
  index: number;
  rawText: string;
  textWithAccent: string;
  textWithoutAccent: string;
  speechText: string;
  speechLength: number;
  speechStartCharIndex: number;
  wordIndex: number;
};

export type ParsedWordNode = {
  type: "word";
  index: number;
  rawText: string;
  speechText: string;
  speechStartCharIndex: number;
  syllables: ParsedSyllable[];
};

export type ParsedSpaceNode = {
  type: "space";
  text: string;
};

export type ParsedSymbolNode = {
  type: "symbol";
  rawText: string;
  textWithAccent: string;
  textWithoutAccent: string;
  speechText: string;
  speechLength: number;
  speechStartCharIndex: number;
};

export type DictionaryNode = ParsedWordNode | ParsedSpaceNode | ParsedSymbolNode;

export type ParsedDictionaryEntry = {
  rawText: string;
  displayText: string;
  speechText: string;
  nodes: DictionaryNode[];
  syllables: ParsedSyllable[];
  rewardMarkers: RewardMarker[];
};
