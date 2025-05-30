"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChunks = void 0;
const getChunks = (array, size) => Array.from({ length: Math.ceil(array.length / size) }).map(() => array.splice(0, size));
exports.getChunks = getChunks;
