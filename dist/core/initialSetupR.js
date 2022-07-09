"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRscript = exports.installPackages = void 0;
const r_script_1 = __importDefault(require("r-script"));
// import R from 'r-script';
const params_1 = require("../params");
const child_process_1 = require("child_process");
const fix_path_1 = __importDefault(require("fix-path"));
const installPackages = async () => {
    (0, fix_path_1.default)();
    return new Promise((resolve, reject) => {
        const child = (0, r_script_1.default)(`${params_1.topDir}/algorithm/R/initialSetup.r`)
            .data()
            .call((err, d) => {
            if (err) {
                const errMsg = new TextDecoder().decode(err);
                console.error(errMsg);
                reject(err);
            }
            else {
                console.log('cv done');
            }
        });
        try {
            global.childProcessList.push(child);
        }
        catch (e) {
            console.error(e);
        }
    });
};
exports.installPackages = installPackages;
const checkRscript = async () => {
    (0, fix_path_1.default)();
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.exec)('Rscript');
        resolve(true);
        try {
            global.childProcessList.push(child);
        }
        catch (e) {
            console.error(e);
        }
    });
};
exports.checkRscript = checkRscript;
const initialSetupFunction = {
    installPackages: exports.installPackages,
    checkRscript: exports.checkRscript,
};
exports.default = initialSetupFunction;
//# sourceMappingURL=initialSetupR.js.map