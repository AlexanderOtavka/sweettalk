import passThroughTypeMatches from "../lib/passThroughTypeMatches"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"
import { ok } from "../lib/result"
import { startEndFromLocation } from "../lib/compile"

export const parseValue = (tokens: readonly any[]) =>
  passThroughTypeMatches(tokens, ["literal"])

export const compileToJs = (
  ast: any,
  _environment: any,
  _block: any[],
  _compile: (ast: any, environment: any, block: any[]) => any,
) =>
  match(ast, [
    [
      { type: "literal" },
      ({ value, location }) =>
        something(
          ok({ type: "Literal", value, ...startEndFromLocation(location) }),
        ),
    ],
    [ANY, _ => nothing],
  ])
