import { lexWithLexers, symbolLexer } from "../lib/lex"
import { locatedError } from "../lib/error"
import {
  rangeLocationFromLocations,
  rangeLocation,
  locationLeftBound,
  locationRightBound,
} from "../lib/location"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"
import { error, ok, forOkResult } from "../lib/result"
import { startEndFromLocation } from "../lib/compile"
import { expectToken } from "../lib/parse"

const lexers = [
  symbolLexer("=", "declarator"),
  symbolLexer(";", "statement ending"),
]
export const lex = (subFile: string) => lexWithLexers(subFile, lexers)

export const parseConstruction = (tokens: readonly any[], parsers: any) => {
  if (
    tokens.length === 0 ||
    tokens[0].type !== "word" ||
    tokens[0].word !== "let"
  ) {
    return { consumed: 0, errors: [] }
  }

  const nameExpectResult = expectToken(tokens, 1, "name")
  if (nameExpectResult.consumed === 0) {
    return nameExpectResult
  }

  const name = tokens[1]

  const assignExpectResult = expectToken(tokens, 2, "declarator")
  if (assignExpectResult.consumed === 0) {
    return assignExpectResult
  }

  const {
    consumed: bindConsumed,
    ast: bind,
    errors: bindErrors,
  } = parsers.parseExpression(tokens.slice(3))
  if (bindConsumed === 0) {
    return { consumed: 0, errors: bindErrors }
  }

  const statementEndingExpectResult = expectToken(
    tokens,
    3 + bindConsumed,
    "statement ending",
  )
  if (statementEndingExpectResult.consumed === 0) {
    return statementEndingExpectResult
  }

  const {
    consumed: bodyConsumed,
    ast: body,
    errors: bodyErrors,
  } = parsers.parseExpression(tokens.slice(4 + bindConsumed))
  if (bodyConsumed === 0) {
    return { consumed: 0, errors: bodyErrors }
  }

  return {
    consumed: 4 + bindConsumed + bodyConsumed,
    ast: {
      type: "let",
      name,
      bind,
      body,
      location: rangeLocationFromLocations(tokens[0].location, body.location),
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
      { type: "let" },
      ({ name: { name, location: nameLocation }, bind, body, location }) => {
        if (Object.prototype.hasOwnProperty.call(environment, name)) {
          return something(
            error([
              locatedError(
                `There is already a variable named '${name}'`,
                nameLocation,
              ),
            ]),
          )
        }

        const jsName = `${name}__${block.length}`
        const newEnvironment = { ...environment, [name]: jsName }

        return something(
          forOkResult(compile(bind, newEnvironment, block), bindJsAst => {
            block.push({
              type: "VariableDeclaration",
              kind: "const",
              declarations: [
                {
                  type: "VariableDeclarator",
                  id: {
                    type: "Identifier",
                    name: jsName,
                    ...startEndFromLocation(nameLocation),
                  },
                  init: bindJsAst,
                  ...startEndFromLocation(
                    rangeLocationFromLocations(nameLocation, bind.location),
                  ),
                },
              ],
              ...startEndFromLocation(
                rangeLocation(
                  locationLeftBound(location),
                  locationRightBound(bind.location),
                ),
              ),
            })
            return compile(body, newEnvironment, block)
          }),
        )
      },
    ],
    [ANY, _ => nothing],
  ])
