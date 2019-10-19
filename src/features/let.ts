import { locatedError } from "../lib/error"
import {
  rangeLocationFromLocations,
  rangeLocation,
  locationLeftBound,
  locationRightBound,
} from "../lib/location"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"
import { error, forOkResult } from "../lib/result"
import { startEndFromLocation } from "../lib/compile"
import { expectConsumption } from "../lib/parse"

export const parsers = {
  parseConstruction: (tokens: readonly any[], parsers: any) => {
    if (
      tokens.length === 0 ||
      tokens[0].type !== "word" ||
      tokens[0].word !== "let"
    ) {
      return { consumed: 0, errors: [] }
    }

    const {
      consumed: declarationConsumed,
      ast: declaration,
      errors: declarationErrors,
    } = expectConsumption(
      tokens,
      1,
      parsers.parseDeclaration(tokens.slice(1), parsers),
      "declaration",
    )
    if (declarationConsumed === 0) {
      return { consumed: 0, errors: declarationErrors }
    }

    const {
      consumed: bodyConsumed,
      ast: body,
      errors: bodyErrors,
    } = expectConsumption(
      tokens,
      1 + declarationConsumed,
      parsers.parseExpression(tokens.slice(1 + declarationConsumed)),
      "expression",
    )
    if (bodyConsumed === 0) {
      return { consumed: 0, errors: bodyErrors }
    }

    return {
      consumed: 1 + declarationConsumed + bodyConsumed,
      ast: {
        type: "let",
        declaration,
        body,
        location: rangeLocationFromLocations(tokens[0].location, body.location),
      },
    }
  },
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
      ({
        declaration: {
          name: { name, location: nameLocation },
          bind,
          location: declarationLocation,
        },
        body,
        location,
      }) => {
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
                  ...startEndFromLocation(declarationLocation),
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
