import { locatedError } from "../lib/error"
import { rangeLocationFromLocations } from "../lib/location"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"
import { forOkResult, isOk, ok } from "../lib/result"
import { startEndFromLocation } from "../lib/compile"

export const parseProgram = (tokens: readonly any[], parsers: any) => {
  const body = []
  let consumed = 0
  while (consumed < tokens.length) {
    const { consumed: statementConsumed, ast, errors } = parsers.parseStatement(
      tokens.slice(consumed),
    )
    if (statementConsumed === 0) {
      if (errors.length > 0) {
        return { consumed: 0, errors }
      } else {
        return {
          consumed: 0,
          errors: [
            locatedError(
              `Unexpected ${tokens[consumed].type}`,
              tokens[consumed].location,
            ),
          ],
        }
      }
    }

    body.push(ast)
    consumed += statementConsumed
  }

  return {
    consumed,
    ast: {
      type: "program",
      body,
      location: rangeLocationFromLocations(
        tokens[0].location,
        tokens[tokens.length - 1].location,
      ),
    },
  }
}

export const compileToJs = (
  ast: any,
  environment: any,
  _block: any[],
  compile: (ast: any, environment: any, block: any[]) => any,
) =>
  match(ast, [
    [
      { type: "program" },
      ({ body, location }: { body: any[]; location: any }) => {
        const newEnvironment = body.reduce(
          (newEnvironment, statement, i) => {
            if (statement.type === "define") {
              const { name } = statement.declaration.name
              newEnvironment[name] = `${name}__${i}_defined`
            }

            return newEnvironment
          },
          { ...environment },
        )

        const compiledBody = []
        for (const statement of body) {
          const result = compile(statement, newEnvironment, compiledBody)
          if (isOk(result)) {
            compiledBody.push(result.value)
          } else {
            return something(result)
          }
        }

        return something(
          ok({
            type: "Program",
            sourceType: "module",
            body: compiledBody,
            ...startEndFromLocation(location),
          }),
        )
      },
    ],
    [ANY, _ => nothing],
  ])