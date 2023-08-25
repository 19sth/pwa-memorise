export interface ICard {
  key: string;
  value: string;
}

export interface ITopic {
  name: string;
  cards: ICard[];
}

export const KEY_TOPICS = "memorise_topics";

export function shuffleArray(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function createShuffledIndices(size: number): number[] {
  if (size <= 0) {
    throw new Error("Size must be a positive number.");
  }
  const indices = Array.from({ length: size }, (_, index) => index);
  return shuffleArray(indices);
}
