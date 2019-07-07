import * as fs from "fs"
import * as path from "path"

const loadFeatures = () => {
  const features = fs
    .readdirSync("../features")
    .map(fileName => path.basename(fileName, path.extname(fileName)))
    .filter(baseName => !baseName.match(/\.spec$/))
    .map(baseName => path.join("../features", baseName))
    .map(pathName => require(pathName))

  return {
    lex: features.map(feature => feature.lex).filter(Boolean),
  }
}

export default loadFeatures
