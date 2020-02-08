import { expectConsumption } from "../lib/parse"
import { rangeLocationFromLocations } from "../lib/location"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"
import { ok, forOkResult } from "../lib/result"
import { startEndFromLocation } from "../lib/compile"
import { leaksNames, getLeakedNames } from "../lib/leakyNames"

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
      parsers.parseDeclaration(tokens.slice(1), parsers),
      "declaration",
    )
    if (declarationConsumed === 0) {
      return { consumed: 0, errors: declarationErrors }
    }

    return {
      consumed: 1 + declarationConsumed,
      ast: leaksNames(
        {
          type: "define",
          isExported,
          declaration,
          location: rangeLocationFromLocations(
            tokens[0].location,
            declaration.location,
          ),
        },
        getLeakedNames(declaration),
      ),
    }
  },
}

export const compilers = {
  define: (
    { isExported, declaration, location },
    environment: any,
    block: any[],
    compile: (ast: any, ...args: any[]) => any,
  ) =>
    forOkResult(
      compile(declaration, environment, block),
      (declarationJsAst): any => {
        const constAst = {
          type: "VariableDeclaration",
          kind: "const",
          declarations: [declarationJsAst],
          ...startEndFromLocation(location),
        }

        if (isExported) {
          block.push(constAst)

          const [name] = getLeakedNames(declaration)
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
                },
              },
              right: { type: "Identifier", name: environment[name] },
              ...startEndFromLocation(declaration.location),
            },
            ...startEndFromLocation(location),
          })
        } else {
          return ok(constAst)
        }
      },
    ),
}
