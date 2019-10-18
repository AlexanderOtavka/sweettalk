export const lex = (subFile: string) => {
  const match = subFile.match(/^[a-z][a-z0-9]*(_[a-z][a-z0-9]*)*/)
  if (match) {
    const [word] = match
    const afterMatch = subFile.substring(word.length).match(/^\w+/)
    if (afterMatch) {
      return { consumed: 0 }
    } else {
      return { consumed: word.length, newToken: { type: "word", word } }
    }
  } else {
    return { consumed: 0 }
  }
}
