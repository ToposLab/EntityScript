import { EntityMap, Node } from './compiler';
export declare const backwardSearch: (node: Node, depth: number) => Set<string>;
export declare const forwardSearch: (node: Node, depth: number) => Set<string>;
export declare const neighborSearch: (node: Node) => Set<string>;
export interface KeywordMatcher {
    keyword: string;
    regExp: RegExp;
}
export declare class EntityScriptRuntime {
    compiledMap: EntityMap;
    keywordMatchers: KeywordMatcher[];
    constructor();
    load(enxFilePath: string): void;
    match(text: string, depth?: number): string[][];
    recommend(text: string, depth?: number): string[];
    classify(text: string, depth?: number): string[];
}
