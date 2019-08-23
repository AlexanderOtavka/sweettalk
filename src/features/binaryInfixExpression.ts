import {
  something,
  nothing,
  isSomething,
  forSomethingMaybe,
} from "../lib/maybe"
import firstSomething from "../lib/firstSomething"

// Algorithm taken from https://en.wikipedia.org/wiki/Operator-precedence_parser#Precedence_climbing_method
const parsePastLeftHandSide = (
  leftHandSide: any,
  tokens: readonly any[],
  precedenceMatchers: readonly any[],
  parseValue: (tokens: readonly any[]) => any,
) => {
  let currentTokenIndex = 0
  const peekNextToken = () => {
    if (currentTokenIndex < tokens.length) {
      return something(tokens[currentTokenIndex])
    } else {
      return nothing
    }
  }
  const peekOperator = () => {
    return forSomethingMaybe(peekNextToken(), token =>
      firstSomething(precedenceMatchers, (matcher, precedence) =>
        forSomethingMaybe(matcher(token), operator =>
          something({ operator, precedence }),
        ),
      ),
    )
  }

  let peekedOperator = peekOperator()
  while (isSomething(peekedOperator)) {
    const { operator, precedence } = peekedOperator.value
    currentTokenIndex++
    let { consumed: rightHandConsumed, ast: rightHandSide } = parseValue(
      tokens.slice(currentTokenIndex),
    )
    if (rightHandConsumed === 0) {
      return { consumed: 0 }
    }
    currentTokenIndex += rightHandConsumed
    peekedOperator = peekOperator()
    while (
      isSomething(peekedOperator) &&
      peekedOperator.value.precedence > precedence
    ) {
      ;({
        consumed: rightHandConsumed,
        ast: rightHandSide,
      } = parsePastLeftHandSide(
        rightHandSide,
        tokens.slice(currentTokenIndex),
        precedenceMatchers.slice(peekedOperator.value.precedence),
        parseValue,
      ))
      currentTokenIndex += rightHandConsumed
      peekedOperator = peekOperator()
    }
    leftHandSide = {
      type: "binary arithmetic operator",
      operator,
      leftHandSide,
      rightHandSide,
    }
  }

  return {
    consumed: currentTokenIndex,
    ast: leftHandSide,
  }
}

export const parseOperation = (
  tokens: readonly any[],
  parsers: any,
  precedenceMatcherGroups: readonly any[][],
) => {
  const { consumed: leftHandConsumed, ast: leftHandSide } = parsers.parseValue(
    tokens,
  )
  if (leftHandConsumed === 0) {
    return { consumed: 0 }
  }

  const { consumed: consumedPastLeftHand, ast } = parsePastLeftHandSide(
    leftHandSide,
    tokens.slice(leftHandConsumed),
    precedenceMatcherGroups.map(matcherGroup => (token: any) =>
      firstSomething(matcherGroup, matcher => matcher(token)),
    ),
    parsers.parseValue,
  )
  if (consumedPastLeftHand === 0) {
    return { consumed: 0 }
  }

  return {
    consumed: leftHandConsumed + consumedPastLeftHand,
    ast,
  }
}
