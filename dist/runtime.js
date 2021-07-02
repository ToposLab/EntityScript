"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityScriptRuntime = exports.neighborSearch = exports.forwardSearch = exports.backwardSearch = void 0;
const compiler_1 = require("./compiler");
const proprocessor_1 = require("./proprocessor");
const backwardSearch = (node, depth) => {
    const result = new Set(node.names);
    if (depth > 0) {
        for (const parent of node.parents) {
            const items = exports.backwardSearch(parent, depth - 1);
            for (const item of items) {
                result.add(item);
            }
        }
    }
    return result;
};
exports.backwardSearch = backwardSearch;
const forwardSearch = (node, depth) => {
    const result = new Set(node.names);
    if (depth > 0) {
        for (const child of node.children) {
            const items = exports.forwardSearch(child, depth - 1);
            for (const item of items) {
                result.add(item);
            }
        }
    }
    return result;
};
exports.forwardSearch = forwardSearch;
const neighborSearch = (node) => {
    const result = new Set(node.names);
    for (const parent of node.parents) {
        const nodes = parent.children;
        for (const node of nodes) {
            for (const name of node.names) {
                result.add(name);
            }
        }
    }
    return result;
};
exports.neighborSearch = neighborSearch;
class EntityScriptRuntime {
    constructor() {
        this.compiledMap = {};
        this.keywordMatchers = [];
    }
    load(enxFilePath) {
        const enxScript = proprocessor_1.preprocessEnxFile(enxFilePath);
        const compiledMap = compiler_1.compileEnxScript(enxScript);
        this.compiledMap = compiledMap;
        const keywords = Object.keys(this.compiledMap);
        keywords.sort((a, b) => b.length - a.length);
        for (const keyword of keywords) {
            this.keywordMatchers.push({
                keyword,
                regExp: new RegExp(`${keyword}`, 'ig'),
            });
        }
    }
    match(source, depth = 2) {
        const visitedNodes = new Set();
        const results = [];
        const nodes = Array.isArray(source)
            ? this.matchNodes(source)
            : this.extractNodes(source);
        for (const node of nodes) {
            const result = new Set();
            if (!visitedNodes.has(node)) {
                const backward = exports.backwardSearch(node, depth);
                for (const item of backward) {
                    result.add(item);
                }
                visitedNodes.add(node);
            }
            results.push(Array.from(result));
        }
        return results;
    }
    recommend(source, depth = 2) {
        const visitedNodes = new Set();
        const result = new Set();
        const nodes = Array.isArray(source)
            ? this.matchNodes(source)
            : this.extractNodes(source);
        for (const node of nodes) {
            if (!visitedNodes.has(node)) {
                const backward = exports.backwardSearch(node, depth);
                const forward = exports.forwardSearch(node, depth);
                for (const item of backward)
                    result.add(item);
                for (const item of forward)
                    result.add(item);
                visitedNodes.add(node);
            }
        }
        return Array.from(result);
    }
    classify(source, depth = 5) {
        const visitedNodes = new Set();
        const result = new Set();
        const nodes = Array.isArray(source)
            ? this.matchNodes(source)
            : this.extractNodes(source);
        for (const node of nodes) {
            if (!visitedNodes.has(node)) {
                const items = exports.backwardSearch(node, depth);
                for (const item of items) {
                    result.add(item);
                }
                visitedNodes.add(node);
            }
        }
        return Array.from(result);
    }
    matchNodes(keywords) {
        const keywordSet = new Set(keywords);
        const result = [];
        for (const matcher of this.keywordMatchers) {
            for (const keyword of keywordSet) {
                if (matcher.regExp.test(keyword)) {
                    keywordSet.delete(keyword);
                    result.push(this.compiledMap[matcher.keyword]);
                    break;
                }
            }
        }
        return result;
    }
    extractNodes(text) {
        const result = [];
        for (const matcher of this.keywordMatchers) {
            const keywordReplaced = text.replace(matcher.regExp, '');
            if (keywordReplaced.length < text.length) {
                text = keywordReplaced;
                result.push(this.compiledMap[matcher.keyword]);
            }
        }
        return result;
    }
}
exports.EntityScriptRuntime = EntityScriptRuntime;
//# sourceMappingURL=runtime.js.map