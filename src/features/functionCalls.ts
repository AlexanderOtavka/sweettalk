import { nameToWords, wordsToName } from "../lib/words"
import { rangeLocationFromLocations } from "../lib/location"
import match, { ANY } from "../lib/match"
import { forOkResult, allOkResults, ok } from "../lib/result"
import { something, nothing } from "../lib/maybe"
import { startEndFromLocation } from "../lib/compile"

export const parseWords = (tokens: readonly any[], parsers: any) => {
  if (tokens.length === 0 || tokens[0].type !== "word") {
    return { consumed: 0, errors: [] }
  }

  const words = [tokens[0].word]
  const args = []

  let consumed = 1
  let lastNameLocation = tokens[0].location
  while (consumed < tokens.length) {
    const token = tokens[consumed]
    if (token.type === "word") {
      words.push(token.word)
      consumed++
      lastNameLocation = token.location
    } else if (token.type === "name") {
      words.push(...nameToWords(token.name))
      args.push(token)
      consumed++
      lastNameLocation = token.location
    } else if (token.type === "literal") {
      args.push(token)
      consumed++
    } else if (token.type === "left paren") {
      const result = parsers.parseWords(tokens.slice(consumed))
      if (result.consumed === 0) {
        return result
      }
      args.push(...result.ast.values)
      consumed += result.consumed
    } else {
      break
    }
  }

  return {
    consumed,
    ast: {
      type: "function call",
      callee: {
        type: "name",
        name: wordsToName(words),
        location: rangeLocationFromLocations(
          tokens[0].location,
          lastNameLocation,
        ),
      },
      args,
      location: rangeLocationFromLocations(
        tokens[0].location,
        tokens[consumed - 1].location,
      ),
    },
  }
}

export const compileToJs = (
  ast: any,
  environment: any,
  block: any[],
  compile: (ast: any, environment: any, block: any[]) => any,
) =>
  match(ast, [
    [
      { type: "function call" },
      ({ callee, args, location }) =>
        something(
          forOkResult(compile(callee, environment, block), calleeJsAst =>
            forOkResult(
              allOkResults(
                args.map((arg: any) => compile(arg, environment, block)),
              ),
              argsInJs =>
                ok({
                  type: "CallExpression",
                  callee: calleeJsAst,
                  arguments: argsInJs,
                  ...startEndFromLocation(location),
                }),
            ),
          ),
        ),
    ],
    [ANY, _ => nothing],
  ])
