export const lex = (subFile: string) => {
  if (subFile[0] !== '"') {
    return { consumed: 0 }
  }

  let value = ""

  let i = 1
  while (subFile[i] !== '"') {
    let currentCharacter = subFile[i]
    if (currentCharacter === "\\") {
      i++
      currentCharacter = subFile[i]
      if (currentCharacter === "n") {
        currentCharacter = "\n"
      }
    }
    value += currentCharacter
    i++
  }

  const endIndex = i

  return {
    consumed: endIndex + 1,
    newToken: {
      type: "literal",
      kind: "string",
      value,
    },
  }
}
