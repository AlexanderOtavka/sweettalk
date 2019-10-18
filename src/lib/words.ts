export const nameToWords = (name: string) => name.toLowerCase().split("_")

export const wordsToName = (words: readonly string[]) =>
  words.map(word => word[0].toUpperCase() + word.substring(1)).join("_")
