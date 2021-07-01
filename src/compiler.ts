import jsTokens from 'js-tokens'

export class Node {
  names: string[]
  children: Node[]
  parents: Node[]

  constructor(...names: string[]) {
    this.names = names
    this.children = []
    this.parents = []
  }
}

export interface EntityMap {
  [name: string]: Node
}

export const compileEnxScript = (enxScript: string) => {
  const compiledMap: EntityMap = {}
  const identifierMap: EntityMap = {}
  const tokens = Array.from(jsTokens(enxScript, { jsx: false }))

  const stringify = (literal: string) => {
    return literal.substr(1, literal.length - 2)
  }

  const parseStringList = () => {
    const list: string[] = []

    while (tokens.length > 0) {
      const token = tokens.shift()!

      if (
        token.type === 'WhiteSpace' ||
        token.type === 'LineTerminatorSequence' ||
        token.type === 'SingleLineComment' ||
        token.type === 'MultiLineComment'
      ) {
        continue
      }

      if (token.type === 'StringLiteral') {
        list.push(stringify(token.value))
      } else if (token.type === 'Punctuator') {
        return list
      } else {
        throw new SyntaxError(`Invalid string list element '${token.value}'`)
      }
    }

    throw new SyntaxError('List is not ended')
  }

  const parseNodeList = () => {
    const list: Node[] = []

    while (tokens.length > 0) {
      const token = tokens.shift()!

      if (
        token.type === 'WhiteSpace' ||
        token.type === 'LineTerminatorSequence' ||
        token.type === 'SingleLineComment' ||
        token.type === 'MultiLineComment'
      ) {
        continue
      }

      if (token.type === 'StringLiteral') {
        const name = stringify(token.value)
        const node = compiledMap[name] ?? new Node(name)
        compiledMap[name] ??= node

        list.push(node)
      } else if (token.type === 'IdentifierName') {
        const identifier = token.value
        const node = identifierMap[identifier] ?? new Node()
        identifierMap[identifier] ??= node

        list.push(node)
      } else if (token.type === 'Punctuator') {
        return list
      } else {
        throw new SyntaxError(`Invalid node list element '${token.value}'`)
      }
    }

    throw new SyntaxError('List is not ended')
  }

  const parseOperator = (current: Node, operator: string) => {
    while (tokens.length > 0) {
      const token = tokens.shift()!

      if (
        token.type === 'WhiteSpace' ||
        token.type === 'LineTerminatorSequence' ||
        token.type === 'SingleLineComment' ||
        token.type === 'MultiLineComment'
      ) {
        continue
      }

      if (token.type === 'Punctuator') {
        if (operator === 'is') {
          const names = parseStringList()
          current.names = names

          for (const name of names) {
            compiledMap[name] = current
          }
        } else if (operator === 'has') {
          const nodes = parseNodeList()
          current.children.push(...nodes)

          for (const node of nodes) {
            node.parents.push(current)
          }
        } else if (operator === 'likes') {
          const nodes = parseNodeList()
          current.children.push(...nodes)
        } else {
          throw new SyntaxError(`Invalid opeartion '${operator}'`)
        }

        return
      } else {
        throw new SyntaxError(`Invalid opeartion '${token.value}'`)
      }
    }

    throw new SyntaxError('Invalid opeartion')
  }

  const parseIdentifier = (identifier: string) => {
    const node = identifierMap[identifier] ?? new Node()
    identifierMap[identifier] ??= node

    while (tokens.length > 0) {
      const token = tokens.shift()!

      if (
        token.type === 'WhiteSpace' ||
        token.type === 'LineTerminatorSequence' ||
        token.type === 'SingleLineComment' ||
        token.type === 'MultiLineComment'
      ) {
        continue
      }

      if (token.type === 'IdentifierName') {
        if (!['is', 'has', 'likes'].includes(token.value)) {
          throw new SyntaxError(`Unrecognized operator '${token.value}'`)
        }

        return parseOperator(node, token.value)
      } else {
        throw new SyntaxError(`'${identifier}' is not followed by an operator`)
      }
    }
  }

  while (tokens.length > 0) {
    const token = tokens.shift()!

    if (
      token.type === 'WhiteSpace' ||
      token.type === 'LineTerminatorSequence' ||
      token.type === 'SingleLineComment' ||
      token.type === 'MultiLineComment'
    ) {
      continue
    }

    if (token.type === 'IdentifierName') {
      parseIdentifier(token.value)
    } else {
      throw new SyntaxError(`Invalid token '${token.value}'`)
    }
  }

  return compiledMap
}
