import { lexWithLexers, symbolLexer } from "../lib/lex"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"
import { ok, forOkResult } from "../lib/result"
import { startEndFromLocation } from "../lib/compile"

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

export const compilers = {
  "binary arithmetic operator": (
    { operator, leftHandSide, rightHandSide, location },
    environment: any,
    block: any[],
    compile: (ast: any, environment: any, block: any[]) => any,
  ) =>
    forOkResult(compile(leftHandSide, environment, block), left =>
      forOkResult(compile(rightHandSide, environment, block), right =>
        ok({
          type: "BinaryExpression",
          operator: match(operator, [
            ["add", _ => "+"],
            ["subtract", _ => "-"],
            ["multiply", _ => "*"],
            ["divide", _ => "/"],
          ]),
          left,
          right,
          ...startEndFromLocation(location),
        }),
      ),
    ),
}
