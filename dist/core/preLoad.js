"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const core_1 = __importDefault(require("./core"));
const densityEstimationR_1 = __importDefault(require("./densityEstimationR"));
const mdsEstimationR_1 = __importDefault(require("./mdsEstimationR"));
// import initialSetupFunction from './initialSetupR';
electron_1.contextBridge.exposeInMainWorld('core', core_1.default);
electron_1.contextBridge.exposeInMainWorld('densityEstimationR', densityEstimationR_1.default);
electron_1.contextBridge.exposeInMainWorld('mdsEstimationR', mdsEstimationR_1.default);
global.childProcessList = [];
//# sourceMappingURL=preLoad.js.map