import { compileEnxScript, EntityMap, Node } from './compiler'
import { preprocessEnxFile } from './proprocessor'

export const backwardSearch = (node: Node, depth: number) => {
  const result = new Set(node.names)

  if (depth > 0) {
    for (const parent of node.parents) {
      const items = backwardSearch(parent, depth - 1)

      for (const item of items) {
        result.add(item)
      }
    }
  }

  return result
}

export const forwardSearch = (node: Node, depth: number) => {
  const result = new Set(node.names)

  if (depth > 0) {
    for (const child of node.children) {
      const items = forwardSearch(child, depth - 1)

      for (const item of items) {
        result.add(item)
      }
    }
  }

  return result
}

export const neighborSearch = (node: Node) => {
  const result = new Set(node.names)

  for (const parent of node.parents) {
    const nodes = parent.children

    for (const node of nodes) {
      for (const name of node.names) {
        result.add(name)
      }
    }
  }

  return result
}

export interface KeywordMatcher {
  keyword: string
  regExp: RegExp
}

export class EntityScriptRuntime {
  compiledMap: EntityMap
  keywordMatchers: KeywordMatcher[]

  constructor() {
    this.compiledMap = {}
    this.keywordMatchers = []
  }

  load(enxFilePath: string) {
    const enxScript = preprocessEnxFile(enxFilePath)
    const compiledMap = compileEnxScript(enxScript)

    this.compiledMap = compiledMap

    const keywords = Object.keys(this.compiledMap)
    keywords.sort((a, b) => b.length - a.length)

    for (const keyword of keywords) {
      this.keywordMatchers.push({
        keyword,
        regExp: new RegExp(`${keyword}`, 'i'),
      })
    }
  }

  match(text: string, depth = 2) {
    const visitedNodes = new Set<Node>()
    const results: string[][] = []

    for (const matcher of this.keywordMatchers) {
      const keywordReplaced = text.replace(matcher.regExp, '')

      if (keywordReplaced.length < text.length) {
        text = keywordReplaced

        const node = this.compiledMap[matcher.keyword]
        const result = new Set<string>()

        if (!visitedNodes.has(node)) {
          const backward = backwardSearch(node, depth)

          for (const item of backward) {
            result.add(item)
          }

          visitedNodes.add(node)
        }

        results.push(Array.from(result))
      }
    }

    return results
  }

  recommend(text: string, depth = 2) {
    const visitedNodes = new Set<Node>()
    const result = new Set<string>()

    for (const matcher of this.keywordMatchers) {
      const keywordReplaced = text.replace(matcher.regExp, '')

      if (keywordReplaced.length < text.length) {
        text = keywordReplaced

        const node = this.compiledMap[matcher.keyword]

        if (!visitedNodes.has(node)) {
          const backward = backwardSearch(node, depth)
          const forward = forwardSearch(node, depth)

          for (const item of backward) result.add(item)
          for (const item of forward) result.add(item)

          visitedNodes.add(node)
        }
      }
    }

    return Array.from(result)
  }

  classify(text: string, depth = 5) {
    const visitedNodes = new Set<Node>()
    const result = new Set<string>()

    for (const matcher of this.keywordMatchers) {
      const keywordReplaced = text.replace(matcher.regExp, '')

      if (keywordReplaced.length < text.length) {
        text = keywordReplaced

        const node = this.compiledMap[matcher.keyword]

        if (!visitedNodes.has(node)) {
          const items = backwardSearch(node, depth)

          for (const item of items) {
            result.add(item)
          }

          visitedNodes.add(node)
        }
      }
    }

    return Array.from(result)
  }
}
