import { lexWithLexers, symbolLexer } from "../lib/lex"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"

const lexers = [
  symbolLexer("+", "plus"),
  symbolLexer("-", "minus"),
  symbolLexer("*", "star"),
  symbolLexer("/", "divide"),
  symbolLexer("%", "modulo"),
]

export const lex = (subFile: string) => lexWithLexers(subFile, lexers)

export const translateTermOperator = (token: any) =>
  match(token.type, [
    ["plus", _ => something("add")],
    ["minus", _ => something("subtract")],
    [ANY, _ => nothing],
  ])

export const translateFactorOperator = (token: any) =>
  match(token.type, [
    ["star", _ => something("multiply")],
    ["divide", _ => something("divide")],
    ["modulo", _ => something("modulo")],
    [ANY, _ => nothing],
  ])

export const compileToJs = (
  ast: any,
  environment: any,
  block: any[],
  compile: (ast: any, environment: any, block: any[]) => any,
) =>
  match(ast, [
    [
      { type: "binary arithmetic operator" },
      ({ operator, leftHandSide, rightHandSide }) =>
        something({
          type: "BinaryExpression",
          operator: match(operator, [
            ["add", _ => "+"],
            ["subtract", _ => "-"],
            ["multiply", _ => "*"],
            ["divide", _ => "/"],
          ]),
          left: compile(leftHandSide, environment, block),
          right: compile(rightHandSide, environment, block),
        }),
    ],
    [ANY, _ => nothing],
  ])
