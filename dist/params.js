"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rMsgDir = exports.topDir = void 0;
exports.topDir = `${__dirname}`
    .replace('app.asar', 'app.asar.unpacked')
    .replace('main_process', '.');
exports.rMsgDir = `${exports.topDir}/algorithm/Rmessage`;
//# sourceMappingURL=params.js.map