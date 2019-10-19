import * as path from "path"
import listOfObjectsToObjectOfLists from "./listOfObjectsToObjectOfLists"

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
    .filter(fileName => path.extname(fileName) === ".js")
    .map(fileName => path.basename(fileName, path.extname(fileName)))
    .filter(baseName => !baseName.match(/\.spec$/))
    .map(baseName => path.resolve(featuresDir, baseName))
    .map(pathName => require(pathName))

  return listOfObjectsToObjectOfLists(features)
}

export default loadFeatures
