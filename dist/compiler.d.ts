export declare class Node {
    names: string[];
    children: Node[];
    parents: Node[];
    constructor(...names: string[]);
}
export interface EntityMap {
    [name: string]: Node;
}
export declare const compileEnxScript: (enxScript: string) => EntityMap;
