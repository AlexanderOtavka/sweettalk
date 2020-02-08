function pipe(thing: any) {
  return {
    through: (...transforms: ReadonlyArray<(thing: any) => any>) => {
      let transformed = thing
      for (const transform of transforms) {
        transformed = transform(transformed)
      }
      return transformed
    },
  }
}

export default pipe
