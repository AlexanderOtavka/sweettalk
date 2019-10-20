import passThroughTypeMatches from "../lib/passThroughTypeMatches"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"
import { error, ok } from "../lib/result"
import { locatedError } from "../lib/error"
import { startEndFromLocation } from "../lib/compile"

export const lex = (subFile: string) => {
  const match = subFile.match(/^[A-Z][a-z0-9]*(_[A-Z][a-z0-9]*)*/)
  if (match) {
    const [name] = match
    const afterMatch = subFile.substring(name.length).match(/^\w+/)
    if (afterMatch) {
      return { consumed: 0 }
    } else {
      return { consumed: name.length, newToken: { type: "name", name } }
    }
  } else {
    return { consumed: 0 }
  }
}

export const parsers = {
  parseValue: (tokens: readonly any[], _parsers: any) =>
    passThroughTypeMatches(tokens, ["name"]),
}

export const compilers = {
  name: (
    { name, location }: any,
    environment: any,
    _block: any[],
    _compile: (ast: any, environment: any, block: any[]) => any,
  ) =>
    Object.prototype.hasOwnProperty.call(environment, name)
      ? ok({
          type: "Identifier",
          name: environment[name],
          ...startEndFromLocation(location),
        })
      : error(locatedError(`No variable named '${name}'`, location)),
}
