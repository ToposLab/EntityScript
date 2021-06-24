import { intersection } from 'lodash'
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

export class EntityScriptRuntime {
  compiledMap: EntityMap

  constructor() {
    this.compiledMap = {}
  }

  load(enxFilePath: string) {
    const enxScript = preprocessEnxFile(enxFilePath)
    const compiledMap = compileEnxScript(enxScript)

    this.compiledMap = compiledMap
  }

  match(text: string, depth = 2) {
    const keywords = Object.keys(this.compiledMap)

    const visitedNodes = new Set<Node>()
    const results: string[][] = []

    for (const keyword of keywords) {
      if (new RegExp(`${keyword}`, 'i').test(text)) {
        const node = this.compiledMap[keyword]
        const result = new Set<string>()

        if (!visitedNodes.has(node)) {
          visitedNodes.add(node)

          const backward = backwardSearch(node, depth)
          const forward = forwardSearch(node, depth)

          for (const item of backward) {
            result.add(item)
          }

          for (const item of forward) {
            result.add(item)
          }
        }

        results.push(Array.from(result))
      }
    }

    return intersection(...results)
  }

  search(text: string, depth = 2) {
    const keywords = Object.keys(this.compiledMap)
    const visitedNodes = new Set<Node>()
    const result = new Set<string>()

    for (const keyword of keywords) {
      if (new RegExp(`${keyword}`, 'i').test(text)) {
        const node = this.compiledMap[keyword]

        if (!visitedNodes.has(node)) {
          visitedNodes.add(node)

          const backward = backwardSearch(node, depth)
          const forward = forwardSearch(node, depth)

          for (const item of backward) {
            result.add(item)
          }

          for (const item of forward) {
            result.add(item)
          }
        }
      }
    }

    return Array.from(result)
  }

  classify(text: string, depth = 5) {
    const keywords = Object.keys(this.compiledMap)
    const visitedNodes = new Set<Node>()
    const result = new Set<string>()

    for (const keyword of keywords) {
      if (new RegExp(`${keyword}`, 'i').test(text)) {
        const node = this.compiledMap[keyword]

        if (!visitedNodes.has(node)) {
          visitedNodes.add(node)

          const items = backwardSearch(node, depth)

          for (const item of items) {
            result.add(item)
          }
        }
      }
    }

    return Array.from(result)
  }
}
