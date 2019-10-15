import match, { MANY, ANY } from "../lib/match"

const passThroughTypeMatches = (
  tokens: readonly any[],
  types: readonly any[],
) =>
  match(tokens, [
    ...types.map((type): any => [
      [{ type }, ...MANY(ANY)],
      ([ast]) => ({ consumed: 1, ast }),
    ]),
    [ANY, _ => ({ consumed: 0, errors: [] })],
  ])

export default passThroughTypeMatches
