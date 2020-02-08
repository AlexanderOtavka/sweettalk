import passThroughTypeMatches from "../lib/passThroughTypeMatches"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"
import { ok } from "../lib/result"
import { startEndFromLocation } from "../lib/compile"

export const parsers = {
  parseValue: (tokens: readonly any[]) =>
    passThroughTypeMatches(tokens, ["literal"]),
}

export const compilers = {
  literal: (
    { value, location }: any,
    _environment: any,
    _block: any[],
    _compile: (ast: any, environment: any, block: any[]) => any,
  ) => ok({ type: "Literal", value, ...startEndFromLocation(location) }),
}
