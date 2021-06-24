"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityScriptRuntime = exports.forwardSearch = exports.backwardSearch = void 0;
const lodash_1 = require("lodash");
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
class EntityScriptRuntime {
    constructor() {
        this.compiledMap = {};
    }
    load(enxFilePath) {
        const enxScript = proprocessor_1.preprocessEnxFile(enxFilePath);
        const compiledMap = compiler_1.compileEnxScript(enxScript);
        this.compiledMap = compiledMap;
    }
    match(text, depth = 2) {
        const keywords = Object.keys(this.compiledMap);
        const visitedNodes = new Set();
        const results = [];
        for (const keyword of keywords) {
            if (new RegExp(`${keyword}`, 'i').test(text)) {
                const node = this.compiledMap[keyword];
                const result = new Set();
                if (!visitedNodes.has(node)) {
                    visitedNodes.add(node);
                    const backward = exports.backwardSearch(node, depth);
                    const forward = exports.forwardSearch(node, depth);
                    for (const item of backward) {
                        result.add(item);
                    }
                    for (const item of forward) {
                        result.add(item);
                    }
                }
                results.push(Array.from(result));
            }
        }
        return lodash_1.intersection(...results);
    }
    search(text, depth = 2) {
        const keywords = Object.keys(this.compiledMap);
        const visitedNodes = new Set();
        const result = new Set();
        for (const keyword of keywords) {
            if (new RegExp(`${keyword}`, 'i').test(text)) {
                const node = this.compiledMap[keyword];
                if (!visitedNodes.has(node)) {
                    visitedNodes.add(node);
                    const backward = exports.backwardSearch(node, depth);
                    const forward = exports.forwardSearch(node, depth);
                    for (const item of backward) {
                        result.add(item);
                    }
                    for (const item of forward) {
                        result.add(item);
                    }
                }
            }
        }
        return Array.from(result);
    }
    classify(text, depth = 5) {
        const keywords = Object.keys(this.compiledMap);
        const visitedNodes = new Set();
        const result = new Set();
        for (const keyword of keywords) {
            if (new RegExp(`${keyword}`, 'i').test(text)) {
                const node = this.compiledMap[keyword];
                if (!visitedNodes.has(node)) {
                    visitedNodes.add(node);
                    const items = exports.backwardSearch(node, depth);
                    for (const item of items) {
                        result.add(item);
                    }
                }
            }
        }
        return Array.from(result);
    }
}
exports.EntityScriptRuntime = EntityScriptRuntime;
//# sourceMappingURL=runtime.js.map