"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessEnxFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const preprocessEnxFile = (filepath) => {
    const srcDir = path_1.default.dirname(filepath);
    const enxScript = fs_1.default.readFileSync(filepath).toString();
    const lines = enxScript.split('\n');
    const includedFiles = new Set();
    let output = '';
    for (const line of lines) {
        const trimed = line.trim();
        if (trimed.startsWith('#include ')) {
            const includeFilename = trimed.substr(9);
            const includePath = path_1.default.join(srcDir, includeFilename);
            if (!includedFiles.has(includePath)) {
                output += exports.preprocessEnxFile(includePath) + '\n';
                includedFiles.add(includePath);
            }
        }
        else {
            output += line + '\n';
        }
    }
    return output;
};
exports.preprocessEnxFile = preprocessEnxFile;
//# sourceMappingURL=proprocessor.js.map