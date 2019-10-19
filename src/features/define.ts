import { expectConsumption } from "../lib/parse"
import parseDeclaration from "../lib/parseDeclaration"
import { rangeLocationFromLocations } from "../lib/location"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"
import { ok, forOkResult } from "../lib/result"
import { startEndFromLocation } from "../lib/compile"

export const parsers = {
  parseStatement: (tokens: readonly any[], parsers: any) => {
    if (
      tokens.length === 0 ||
      tokens[0].type !== "word" ||
      (tokens[0].word !== "define" && tokens[0].word !== "share")
    ) {
      return { consumed: 0, errors: [] }
    }

    const isExported = tokens[0].word === "share"

    const {
      consumed: declarationConsumed,
      ast: declaration,
      errors: declarationErrors,
    } = expectConsumption(
      tokens,
      1,
      parseDeclaration(tokens.slice(1), parsers),
      "declaration",
    )
    if (declarationConsumed === 0) {
      return { consumed: 0, errors: declarationErrors }
    }

    return {
      consumed: 1 + declarationConsumed,
      ast: {
        type: "define",
        isExported,
        declaration,
        location: rangeLocationFromLocations(
          tokens[0].location,
          declaration.location,
        ),
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
      { type: "define" },
      ({
        isExported,
        declaration: {
          name: { name, location: nameLocation },
          bind,
          location: declarationLocation,
        },
        location,
      }) =>
        something(
          forOkResult(compile(bind, environment, block), (bindJsAst): any => {
            const declaration = {
              type: "VariableDeclaration",
              kind: "const",
              declarations: [
                {
                  type: "VariableDeclarator",
                  id: {
                    type: "Identifier",
                    name: environment[name],
                    ...startEndFromLocation(nameLocation),
                  },
                  init: bindJsAst,
                  ...startEndFromLocation(declarationLocation),
                },
              ],
              ...startEndFromLocation(location),
            }

            if (isExported) {
              block.push(declaration)

              return ok({
                type: "ExpressionStatement",
                expression: {
                  type: "AssignmentExpression",
                  operator: "=",
                  left: {
                    type: "MemberExpression",
                    computed: false,
                    object: { type: "Identifier", name: "exports" },
                    property: {
                      type: "Identifier",
                      name,
                      ...startEndFromLocation(nameLocation),
                    },
                  },
                  right: { type: "Identifier", name: environment[name] },
                  ...startEndFromLocation(declarationLocation),
                },
                ...startEndFromLocation(location),
              })
            } else {
              return ok(declaration)
            }
          }),
        ),
    ],
    [ANY, _ => nothing],
  ])
