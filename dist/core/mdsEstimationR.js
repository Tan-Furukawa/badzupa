"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const r_script_1 = __importDefault(require("r-script"));
// import R from 'r-script';
const params_1 = require("../params");
const fix_path_1 = __importDefault(require("fix-path"));
const mds = async (mdsParams) => {
    (0, fix_path_1.default)();
    return new Promise((resolve, reject) => {
        console.log(`${params_1.topDir}/algorithm/R/mds.r`);
        console.log(mdsParams);
        const child = (0, r_script_1.default)(`${params_1.topDir}/algorithm/R/mds.r`)
            // dataにはdirを渡す！！！
            .data({
            dir: params_1.rMsgDir,
            NBootstrap: mdsParams.NBootstrap,
            ci: mdsParams.ci,
            dataList: mdsParams.dataList.map(d => {
                return d.data.map(dd => ({ age: dd.age, sampleId: d.sampleId }));
            }),
        })
            .call((err, d) => {
            if (err) {
                const errMsg = new TextDecoder().decode(err);
                console.error(errMsg);
                reject(err);
            }
            else {
                console.log(d);
                resolve({
                    ...mdsParams,
                    centerCoordinate: d.X.map((d, i) => ({
                        id: i + 1,
                        x: Number(d.x),
                        y: Number(d.y),
                    })),
                    bootstrapCoordinate: d.bootstrapCoordinate.map((d) => ({
                        id: Number(d.id),
                        x: Number(d.x),
                        y: Number(d.y),
                    })),
                    ellipseCoordinate: d.ellipseCoordinate.map((d) => ({
                        id: Number(d.id),
                        x: Number(d.x),
                        y: Number(d.y),
                    })),
                });
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
const mdsEstimationR = {
    mds,
};
exports.default = mdsEstimationR;
//# sourceMappingURL=mdsEstimationR.js.map