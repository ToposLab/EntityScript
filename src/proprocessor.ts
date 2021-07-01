import fs from 'fs'
import path from 'path'

export const preprocessEnxFile = (filepath: string) => {
  const srcDir = path.dirname(filepath)
  const enxScript = fs.readFileSync(filepath).toString()
  const lines = enxScript.split('\n')
  const includedFiles = new Set<string>()

  let output = ''

  for (const line of lines) {
    const trimed = line.trim()

    if (trimed.startsWith('#include ')) {
      const includeFilename = trimed.substr(9)
      const includePath = path.join(srcDir, includeFilename)

      if (!includedFiles.has(includePath)) {
        output += preprocessEnxFile(includePath) + '\n'
        includedFiles.add(includePath)
      }
    } else {
      output += line + '\n'
    }
  }

  return output
}
