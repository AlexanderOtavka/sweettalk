import match, { MANY, ANY } from "../lib/match"

const passThroughTypeMatches = (
  tokens: readonly any[],
  types: readonly any[],
) =>
  match(tokens, [
    ...types.map((type): any => [
      [{ type }, ...MANY(ANY)],
      ([ust]) => ({ consumed: 1, ust }),
    ]),
    [ANY, _ => ({ consumed: 0 })],
  ])

export default passThroughTypeMatches
