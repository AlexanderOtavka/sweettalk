import {
  something,
  nothing,
  isSomething,
  forSomethingMaybe,
} from "../lib/maybe"
import firstSomething from "../lib/firstSomething"
import { locatedError } from "../lib/error"
import { rangeLocationFromLocations } from "../lib/location"

// Algorithm taken from https://en.wikipedia.org/wiki/Operator-precedence_parser#Precedence_climbing_method
const parsePastLeftHandSide = (
  leftHandSide: any,
  tokens: readonly any[],
  precedenceMatchers: readonly any[],
  parseConstruction: (tokens: readonly any[]) => any,
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
          something({ operator, precedence, token }),
        ),
      ),
    )
  }
  const parseError = ({ operator, token }, errors: readonly any[]) => {
    const rightHandTokenMaybe = peekNextToken()
    return {
      consumed: 0,
      errors: isSomething(rightHandTokenMaybe)
        ? errors.length > 0
          ? errors
          : [
              locatedError(
                `Operator '${operator}' expects an expression on the right hand side.  Got '${rightHandTokenMaybe.value}' instead`,
                rightHandTokenMaybe.value.location,
              ),
            ]
        : [
            locatedError(
              `Expected an expression after the '${operator}', but hit the end of the file instead!`,
              token.location,
            ),
          ],
    }
  }

  let peekedOperator = peekOperator()
  while (isSomething(peekedOperator)) {
    const { operator, precedence } = peekedOperator.value
    currentTokenIndex++
    const rightHandResult = parseConstruction(tokens.slice(currentTokenIndex))
    let { consumed: rightHandConsumed, ast: rightHandSide } = rightHandResult
    if (rightHandConsumed === 0) {
      return parseError(peekedOperator.value, rightHandResult.errors)
    }
    currentTokenIndex += rightHandConsumed
    peekedOperator = peekOperator()
    while (
      isSomething(peekedOperator) &&
      peekedOperator.value.precedence > precedence
    ) {
      const rightHandResult = parsePastLeftHandSide(
        rightHandSide,
        tokens.slice(currentTokenIndex),
        precedenceMatchers.slice(peekedOperator.value.precedence),
        parseConstruction,
      )
      rightHandConsumed = rightHandResult.consumed
      if (rightHandConsumed === 0) {
        return parseError(peekedOperator.value, rightHandResult.errors)
      }
      rightHandSide = rightHandResult.ast
      currentTokenIndex += rightHandConsumed
      peekedOperator = peekOperator()
    }
    leftHandSide = {
      type: "binary arithmetic operator",
      operator,
      leftHandSide,
      rightHandSide,
      location: rangeLocationFromLocations(
        leftHandSide.location,
        rightHandSide.location,
      ),
    }
  }

  if (currentTokenIndex === 0) {
    return { consumed: 0, errors: [] }
  }

  return {
    consumed: currentTokenIndex,
    ast: leftHandSide,
  }
}

export const parsers = {
  parseOperation: (
    tokens: readonly any[],
    parsers: any,
    precedenceMatcherGroups: readonly any[][],
  ) => {
    const {
      consumed: leftHandConsumed,
      ast: leftHandSide,
      errors: leftHandErrors,
    } = parsers.parseConstruction(tokens)
    if (leftHandConsumed === 0) {
      return { consumed: 0, errors: leftHandErrors }
    }

    const {
      consumed: consumedPastLeftHand,
      ast,
      errors: errorsPastLeftHand,
    } = parsePastLeftHandSide(
      leftHandSide,
      tokens.slice(leftHandConsumed),
      precedenceMatcherGroups.map(matcherGroup => (token: any) =>
        firstSomething(matcherGroup, matcher => matcher(token)),
      ),
      parsers.parseConstruction,
    )
    if (consumedPastLeftHand === 0) {
      if (errorsPastLeftHand.length > 0) {
        return { consumed: 0, errors: errorsPastLeftHand }
      } else {
        return {
          consumed: leftHandConsumed,
          ast: leftHandSide,
        }
      }
    }

    return {
      consumed: leftHandConsumed + consumedPastLeftHand,
      ast,
    }
  },
}
