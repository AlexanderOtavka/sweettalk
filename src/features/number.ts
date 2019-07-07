export const lex = (subFile: string) => {
  const match = subFile.match(/^\d[\d,]*\d?(\.\d[\d,]*\d)?/)
  if (match) {
    return {
      consumed: match[0].length,
      newToken: { type: "number", value: +match[0] },
    }
  } else {
    return { consumed: 0 }
  }
}

export const parse = (tokens: readonly any[]) => {
  if (tokens[0].type === "number") {
    return { consumed: 1, ast: { type: "number", value: tokens[0].value } }
  } else {
    return { consumed: 0 }
  }
}
