import { locationLeftBound, locationRightBound } from "./location"
import { Result } from "./result"

export const startEndFromLocation = (location: any) => ({
  start: locationLeftBound(location),
  end: locationRightBound(location),
})

const compileWithArgs = (
  ast: any,
  args: readonly any[],
  compilers: any,
): Result<any, any> => {
  if (ast.type in compilers) {
    return compilers[ast.type](
      ast,
      ...args,
      (ast: any, ...args: readonly any[]) =>
        compileWithArgs(ast, args, compilers),
    )
  } else {
    throw Error(`Nothing matched ${ast.type}`)
  }
}

export const compileAstToJs = (
  ast: any,
  environment: any,
  compilers: readonly any[],
) => compileWithArgs(ast, [environment], Object.assign({}, ...compilers))
