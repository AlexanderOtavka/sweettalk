import { lexWithLexers, symbolLexer } from "../lib/lex"
import match, { ANY } from "../lib/match"
import {
  something,
  nothing,
  isSomething,
  forSomethingMaybe,
} from "../lib/maybe"
import firstSomething from "../lib/firstSomething"

const lexers = [
  symbolLexer("+", "plus"),
  symbolLexer("-", "minus"),
  symbolLexer("*", "star"),
  symbolLexer("/", "divide"),
  symbolLexer("%", "modulo"),
]

export const lex = (subFile: string) => lexWithLexers(subFile, lexers)

const translateArithmeticOperator = (token: any) =>
  match(token.type, [
    ["plus", _ => something("add")],
    ["minus", _ => something("subtract")],
    [ANY, _ => nothing],
  ])

// Algorithm taken from https://en.wikipedia.org/wiki/Operator-precedence_parser#Precedence_climbing_method
const parseBinaryInfixExpression = (
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
      } = parseBinaryInfixExpression(
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

export const parseTerm = (tokens: readonly any[], parsers: any) => {
  const { consumed: leftHandConsumed, ast: leftHandSide } = parsers.parseValue(
    tokens,
  )
  if (leftHandConsumed === 0) {
    return { consumed: 0 }
  }

  const { consumed: operatorConsumed, ast } = parseBinaryInfixExpression(
    leftHandSide,
    tokens.slice(leftHandConsumed),
    [translateArithmeticOperator],
    parsers.parseValue,
  )
  if (operatorConsumed === 0) {
    return { consumed: 0 }
  }

  return {
    consumed: leftHandConsumed + operatorConsumed,
    ast,
  }
}

export const compileToJs = (ast: any, compile: (ast: any) => any) =>
  match(ast, [
    [
      { type: "binary arithmetic operator" },
      ({ operator, leftHandSide, rightHandSide }) =>
        something({
          type: "BinaryExpression",
          operator: match(operator, [
            ["add", _ => "+"],
            ["subtract", _ => "-"],
          ]),
          left: compile(leftHandSide),
          right: compile(rightHandSide),
        }),
    ],
    [ANY, _ => nothing],
  ])
