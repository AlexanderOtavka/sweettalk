import { lexWithLexers, symbolLexer } from "../lib/lex"
import { expectToken, expectConsumption } from "../lib/parse"
import { rangeLocationFromLocations } from "../lib/location"
import { ok, forOkResult } from "../lib/result"
import { startEndFromLocation } from "../lib/compile"
import { leaksNames } from "../lib/leakyNames"

const lexers = [
  symbolLexer("=", "declarator"),
  symbolLexer(";", "statement ending"),
]
export const lex = (subFile: string) => lexWithLexers(subFile, lexers)

export const parsers = {
  parseDeclaration: (tokens: readonly any[], parsers: any) => {
    if (tokens.length === 0 || tokens[0].type !== "name") {
      return { consumed: 0, errors: [] }
    }

    const name = tokens[0]

    const assignExpectResult = expectToken(tokens, 1, "declarator")
    if (assignExpectResult.consumed === 0) {
      return assignExpectResult
    }

    const {
      consumed: bindConsumed,
      ast: bind,
      errors: bindErrors,
    } = expectConsumption(
      tokens,
      2,
      parsers.parseExpression(tokens.slice(2)),
      "expression",
    )
    if (bindConsumed === 0) {
      return { consumed: 0, errors: bindErrors }
    }

    const statementEndingExpectResult = expectToken(
      tokens,
      2 + bindConsumed,
      "statement ending",
    )
    if (statementEndingExpectResult.consumed === 0) {
      return statementEndingExpectResult
    }

    return {
      consumed: bindConsumed + 3,
      ast: leaksNames(
        {
          type: "declaration",
          name,
          bind,
          location: rangeLocationFromLocations(
            name.location,
            statementEndingExpectResult.token.location,
          ),
        },
        [name.name],
      ),
    }
  },
}

export const compilers = {
  declaration: (
    { name: { name, location: nameLocation }, bind, location }: any,
    environment: any,
    block: any[],
    compile: (ast: any, ...args: any[]) => any,
  ) => {
    return forOkResult(compile(bind, environment, block), bindJsAst =>
      ok({
        type: "VariableDeclarator",
        id: {
          type: "Identifier",
          name: environment[name],
          ...startEndFromLocation(nameLocation),
        },
        init: bindJsAst,
        ...startEndFromLocation(location),
      }),
    )
  },
}
