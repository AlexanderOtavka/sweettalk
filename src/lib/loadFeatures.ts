import * as path from "path"

const loadFeatures = (
  featuresDir: string,
  {
    readdirSync,
    require,
  }: {
    readonly readdirSync: (dirName: string) => string[]
    readonly require: (fileName: string) => object
  },
) => {
  const features = readdirSync(path.resolve(featuresDir))
    .map(fileName => path.basename(fileName, path.extname(fileName)))
    .filter(baseName => !baseName.match(/\.spec$/))
    .map(baseName => path.resolve(featuresDir, baseName))
    .map(pathName => require(pathName))

  const apis = [
    ...new Set(
      features
        .map(Object.keys)
        .reduce((apis, featureApi) => [...apis, ...featureApi]),
    ),
  ]

  return Object.assign(
    {},
    ...apis.map(api => ({
      [api]: features.map(feature => feature[api]).filter(Boolean),
    })),
  )
}

export default loadFeatures
