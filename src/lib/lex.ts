const symbolLexer = (symbol: string, typeName: string) => (subFile: string) => {
  if (subFile.substring(0, symbol.length) === symbol) {
    return { consumed: symbol.length, newToken: { type: typeName } };
  } else {
    return { consumed: 0 };
  }
};

const keywordLexer = (keyword: string) => symbolLexer(keyword, keyword);

const lexIndent = (subFile: string) => {
  const match = subFile.match(/^\n[ \t]+/m);
  if (match) {
    return {
      consumed: match[0].length,
      newToken: { type: 'indent', value: match[0].substring(1) }
    };
  } else {
    return { consumed: 0 };
  }
};

const lexNumber = (subFile: string) => {
  const match = subFile.match(/^\d[\d,]*\d?(\.\d[\d,]*\d)?/);
  if (match) {
    return {
      consumed: match[0].length,
      newToken: { type: 'number', value: +match[0] }
    };
  } else {
    return { consumed: 0 };
  }
};

const lexWord = (subFile: string) => {
  const match = subFile.match(/^/);
  if (match) {
    return {
      consumed: match[0].length,
      newToken: { type: 'number', value: +match[0] }
    };
  } else {
    return { consumed: 0 };
  }
};

const lexers = [
  lexIndent,
  keywordLexer('let'),
  keywordLexer('is'),
  keywordLexer('are'),
  keywordLexer('returns'),
  keywordLexer('new'),
  keywordLexer('if'),
  keywordLexer('then'),
  keywordLexer('else'),
  symbolLexer('(', 'lParen'),
  symbolLexer(')', 'rParen'),
  symbolLexer('[', 'lBracket'),
  symbolLexer(']', 'rBracket'),
  symbolLexer('{', 'lBrace'),
  symbolLexer('}', 'rBrace'),
  symbolLexer(':', 'colon'),
  symbolLexer(',', 'comma'),
  symbolLexer('.', 'dot'),
  symbolLexer('=>', 'functionAssign'),
  symbolLexer('=', 'assign'),
  symbolLexer('->', 'property'),
  symbolLexer('|>', 'rPipeline'),
  symbolLexer('<>', 'hole'),
  symbolLexer('#', 'hash'),
  symbolLexer('?', 'question'),
  symbolLexer('?!', 'questionBang')
];

export const lexFile = (file: string) => {
  const lexSubFile = (subFile: string, tokensSoFar: ReadonlyArray<any>) => {
    for (const lex of lexers) {
      const { consumed, newToken } = lex(subFile);
      if (consumed !== 0) {
        return lexSubFile(subFile.substring(consumed), [
          ...tokensSoFar,
          newToken
        ]);
      }
    }

    throw Error(`Unknown symbol: ${subFile[0]}`);
  };

  return lexSubFile(file, []);
};
