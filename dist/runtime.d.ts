import { EntityMap, Node } from './compiler';
export declare const backwardSearch: (node: Node, depth: number) => Set<string>;
export declare const forwardSearch: (node: Node, depth: number) => Set<string>;
export declare class EntityScriptRuntime {
    compiledMap: EntityMap;
    constructor();
    load(enxFilePath: string): void;
    match(text: string, depth?: number): string[];
    search(text: string, depth?: number): string[];
    classify(text: string, depth?: number): string[];
}
