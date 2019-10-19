import { expectToken, expectConsumption } from "./parse"
import { rangeLocationFromLocations } from "./location"

const parseDeclaration = (tokens: readonly any[], parsers: any) => {
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
    ast: {
      type: "declaration",
      name,
      bind,
      location: rangeLocationFromLocations(
        name.location,
        statementEndingExpectResult.token.location,
      ),
    },
  }
}

export default parseDeclaration
