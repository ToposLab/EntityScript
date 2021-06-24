"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileEnxScript = exports.Node = void 0;
const js_tokens_1 = __importDefault(require("js-tokens"));
class Node {
    constructor(...names) {
        this.names = names;
        this.children = [];
        this.parents = [];
    }
}
exports.Node = Node;
const compileEnxScript = (enxScript) => {
    const compiledMap = {};
    const identifierMap = {};
    const tokens = Array.from(js_tokens_1.default(enxScript, { jsx: false }));
    const stringify = (literal) => {
        return literal.substr(1, literal.length - 2);
    };
    const parseStringList = () => {
        const list = [];
        while (tokens.length > 0) {
            const token = tokens.shift();
            if (token.type === 'WhiteSpace' ||
                token.type === 'LineTerminatorSequence' ||
                token.type === 'SingleLineComment' ||
                token.type === 'MultiLineComment') {
                continue;
            }
            if (token.type === 'StringLiteral') {
                list.push(stringify(token.value));
            }
            else if (token.type === 'Punctuator') {
                return list;
            }
            else {
                throw new SyntaxError('Invalid string list element');
            }
        }
        throw new SyntaxError('List is not ended');
    };
    const parseNodeList = () => {
        var _a, _b, _c, _d;
        const list = [];
        while (tokens.length > 0) {
            const token = tokens.shift();
            if (token.type === 'WhiteSpace' ||
                token.type === 'LineTerminatorSequence' ||
                token.type === 'SingleLineComment' ||
                token.type === 'MultiLineComment') {
                continue;
            }
            if (token.type === 'StringLiteral') {
                const name = stringify(token.value);
                const node = (_a = compiledMap[name]) !== null && _a !== void 0 ? _a : new Node(name);
                (_b = compiledMap[name]) !== null && _b !== void 0 ? _b : (compiledMap[name] = node);
                list.push(node);
            }
            else if (token.type === 'IdentifierName') {
                const identifier = token.value;
                const node = (_c = identifierMap[identifier]) !== null && _c !== void 0 ? _c : new Node();
                (_d = identifierMap[identifier]) !== null && _d !== void 0 ? _d : (identifierMap[identifier] = node);
                list.push(node);
            }
            else if (token.type === 'Punctuator') {
                return list;
            }
            else {
                throw new SyntaxError('Invalid node list element');
            }
        }
        throw new SyntaxError('List is not ended');
    };
    const parseOperator = (current, operator) => {
        while (tokens.length > 0) {
            const token = tokens.shift();
            if (token.type === 'WhiteSpace' ||
                token.type === 'LineTerminatorSequence' ||
                token.type === 'SingleLineComment' ||
                token.type === 'MultiLineComment') {
                continue;
            }
            if (token.type === 'Punctuator') {
                if (operator === 'is') {
                    const names = parseStringList();
                    current.names = names;
                    for (const name of names) {
                        compiledMap[name] = current;
                    }
                }
                else if (operator === 'has') {
                    const nodes = parseNodeList();
                    current.children.push(...nodes);
                    for (const node of nodes) {
                        node.parents.push(current);
                    }
                }
                else if (operator === 'likes') {
                    const nodes = parseNodeList();
                    current.children.push(...nodes);
                }
                return;
            }
            else {
                throw new SyntaxError('Invalid opeartion');
            }
        }
        throw new SyntaxError('Invalid opeartion');
    };
    const parseIdentifier = (identifier) => {
        var _a, _b;
        const node = (_a = identifierMap[identifier]) !== null && _a !== void 0 ? _a : new Node();
        (_b = identifierMap[identifier]) !== null && _b !== void 0 ? _b : (identifierMap[identifier] = node);
        while (tokens.length > 0) {
            const token = tokens.shift();
            if (token.type === 'WhiteSpace' ||
                token.type === 'LineTerminatorSequence' ||
                token.type === 'SingleLineComment' ||
                token.type === 'MultiLineComment') {
                continue;
            }
            if (token.type === 'IdentifierName') {
                if (!['is', 'has', 'likes'].includes(token.value)) {
                    throw new SyntaxError(`Unrecognized operator '${token.value}'`);
                }
                return parseOperator(node, token.value);
            }
            else {
                throw new SyntaxError('An entity should be followed by an operator');
            }
        }
    };
    while (tokens.length > 0) {
        const token = tokens.shift();
        if (token.type === 'WhiteSpace' ||
            token.type === 'LineTerminatorSequence' ||
            token.type === 'SingleLineComment' ||
            token.type === 'MultiLineComment') {
            continue;
        }
        if (token.type === 'IdentifierName') {
            parseIdentifier(token.value);
        }
        else {
            throw new SyntaxError(`Invalid token ${token.value}`);
        }
    }
    return compiledMap;
};
exports.compileEnxScript = compileEnxScript;
//# sourceMappingURL=compiler.js.map