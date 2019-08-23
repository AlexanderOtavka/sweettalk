export const preParse = (tokens: readonly any[], replacers: readonly any[]) =>
  replacers.reduce((tokens, replace) => replace(tokens), tokens)
