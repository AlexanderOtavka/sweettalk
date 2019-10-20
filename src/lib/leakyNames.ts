const leakyNamesSymbol = Symbol("leaky names")

export const leaksNames = (ast: any, names: readonly string[]) => ({
  ...ast,
  [leakyNamesSymbol]: [...new Set([...getLeakedNames(ast), ...names])],
})

export const getLeakedNames = (ast: any) => ast[leakyNamesSymbol] || []
