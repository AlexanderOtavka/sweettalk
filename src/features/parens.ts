import { symbolLexer, lexWithLexers } from "../lib/lex"
import { expectToken, expectAnyToken } from "../lib/parse"
import { rangeLocationFromLocations } from "../lib/location"
import { locatedError } from "../lib/error"
import { something, nothing } from "../lib/maybe"
import match, { ANY } from "../lib/match"
import { error } from "../lib/result"

const lexers = [symbolLexer("(", "left paren"), symbolLexer(")", "right paren")]

export const lex = (subFile: string) => lexWithLexers(subFile, lexers)

const parseList = (
  tokens: readonly any[],
  separatorType: string,
  endType: string,
  parsers: any,
) => {
  const expectEndResult = expectAnyToken(tokens, 0, endType)
  if (expectEndResult.consumed === 0) {
    return expectEndResult
  }

  if (tokens[0].type === endType) {
    return { consumed: 1, ast: [] }
  }

  const { consumed, ast, errors } = parsers.parseExpression(tokens)
  if (consumed === 0) {
    return { consumed: 0, errors }
  }

  const expectSeparatorResult = expectAnyToken(tokens, consumed, separatorType)
  if (expectSeparatorResult.consumed === 0) {
    return expectSeparatorResult
  }

  if (tokens[consumed].type === separatorType) {
    const rest = parseList(
      tokens.slice(consumed + 1),
      separatorType,
      endType,
      parsers,
    )
    if (rest.consumed === 0) {
      return rest
    }
    return {
      consumed: consumed + 1 + rest.consumed,
      ast: [ast, ...rest.ast],
    }
  } else if (tokens[consumed].type === endType) {
    return {
      consumed: consumed + 1,
      ast: [ast],
    }
  } else {
    return {
      consumed: 0,
      errors: [
        locatedError(
          `Expected ${separatorType} or ${endType}, but got '${tokens[consumed].type}'`,
          tokens[consumed].location,
        ),
      ],
    }
  }
}

export const parseValue = (tokens: readonly any[], parsers: any) => {
  if (tokens.length === 0 || tokens[0].type !== "left paren") {
    return { consumed: 0, errors: [] }
  }

  const { consumed, ast, errors } = parseList(
    tokens.slice(1),
    "comma",
    "right paren",
    parsers,
  )
  if (consumed === 0) {
    return { consumed: 0, errors }
  }

  const lastTokenInside = tokens[consumed - 1]
  const hasTrailingComma = lastTokenInside.type === "comma"
  return {
    consumed: consumed + 1,
    ast: {
      type: "parens",
      values: ast,
      hasTrailingComma,
      trailingCommaLocation: hasTrailingComma ? lastTokenInside.location : null,
      location: rangeLocationFromLocations(
        tokens[0].location,
        tokens[consumed].location,
      ),
    },
  }
}

export const compileToJs = (
  ast: any,
  environment: any,
  block: any[],
  compile: (ast: any, environment: any, block: any[]) => any,
) =>
  match(ast, [
    [
      { type: "parens" },
      that =>
        something(
          match(that, [
            [
              { values: [ANY], hasTrailingComma: false },
              ({ values: [value] }) => compile(value, environment, block),
            ],
            [
              { values: [ANY], hasTrailingComma: true },
              ({ trailingCommaLocation }) =>
                error(locatedError("Unexpected comma", trailingCommaLocation)),
            ],
            [
              { values: [] },
              ({ location }) =>
                error(
                  locatedError(
                    "Unexpected empty parens. Put something between them!",
                    location,
                  ),
                ),
            ],
            [
              ANY,
              ({ values }) =>
                error(
                  locatedError(
                    "Only one value expected in parens",
                    rangeLocationFromLocations(
                      ...values.slice(1).map(({ location }) => location),
                    ),
                  ),
                ),
            ],
          ]),
        ),
    ],
    [ANY, _ => nothing],
  ])
