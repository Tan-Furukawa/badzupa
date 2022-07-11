"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartElectronApp = void 0;
const dbConnection_1 = require("./dbConnection");
const pdfkit_1 = __importDefault(require("pdfkit"));
const svg_to_pdfkit_1 = __importDefault(require("svg-to-pdfkit"));
const blob_stream_1 = __importDefault(require("blob-stream"));
const config_1 = require("../components/plot/config");
const path_1 = __importDefault(require("path"));
const params_1 = require("../params");
const fs_extra_1 = __importDefault(require("fs-extra"));
const chokidar = __importStar(require("chokidar"));
const restartElectronApp = () => {
    global.childProcessList.forEach(childProcess => {
        childProcess.kill('SIGINT');
    });
    global.childProcessList = [];
    location.reload();
    // app.relaunch();
    // app.quit();
};
exports.restartElectronApp = restartElectronApp;
const dataFilePath = path_1.default.join(`${params_1.topDir}/data`, `sampleList.json`);
const watchFileEvent = (path, callback) => {
    const watcher = chokidar.watch(`${params_1.topDir}/${path}`, {
        ignored: /[\\/\\\\]\./,
        persistent: true,
    });
    watcher.on('ready', () => {
        watcher.on('change', async (pathName) => {
            const content = fs_extra_1.default.readFileSync(pathName, 'utf8');
            callback(content);
        });
    });
};
// const getInitialSetupData = async () => {
//   const exist = await fs.pathExists(initialSetupPath); // ...(b)
//   if (!exist) {
//     // ...(c)
//     // データファイルがなけれが、ファイルを作成して、初期データを保存する
//     fs.ensureFileSync(dataFilePath);
//     await fs.writeJSON(dataFilePath, { initialSetupStatus: 0 });
//   }
//   const jsonData = (await fs.readJSON(dataFilePath)) as IInitialSetup;
//   return jsonData.initialSetupStatus;
// };
// const saveInitialSetupData = async (done: 0 | 1): Promise<void> => {
//   await fs.writeJSON(
//     initialSetupPath,
//     {
//       initialSetupStatus: done,
//     },
//     {
//       spaces: 2,
//     },
//   );
// };
const saveAsPDF = (str) => {
    const doc = new pdfkit_1.default({
        bufferPages: true,
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${config_1.viewParam.width} ${config_1.viewParam.height * 1.1}">
  ${str} </svg>`;
    const stream = doc.pipe((0, blob_stream_1.default)());
    (0, svg_to_pdfkit_1.default)(doc, svg, 0, 0);
    doc.end();
    stream.on('finish', function () {
        const blob = stream.toBlobURL('application/pdf');
        const a = document.createElement('a');
        a.download = 'output.pdf';
        a.href = blob;
        a.addEventListener('click', () => {
            setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
        });
        a.click();
    });
};
const loadSampleListFromJSON = async () => {
    const exist = await fs_extra_1.default.pathExists(dataFilePath); // ...(b)
    if (!exist) {
        // ...(c)
        // データファイルがなけれが、ファイルを作成して、初期データを保存する
        fs_extra_1.default.ensureFileSync(dataFilePath);
        await fs_extra_1.default.writeJSON(dataFilePath, { sampleStatusList: [] });
    }
    const jsonData = (await fs_extra_1.default.readJSON(dataFilePath));
    return jsonData.sampleStatusList;
};
const toggleDoneSampleListFromJSON = async (sampleId) => {
    const jsonData = (await fs_extra_1.default.readJSON(dataFilePath));
    await fs_extra_1.default.writeJSON(dataFilePath, {
        sampleStatusList: jsonData.sampleStatusList.map(d => {
            return d.sampleId === sampleId ? { ...d, done: 1 } : d;
        }),
    }, {
        spaces: 2,
    });
};
const saveSampleListToJSON = async (sampleStatus) => {
    const prevSampleStatusList = await loadSampleListFromJSON();
    const sampleExist = prevSampleStatusList.filter(s => s.sampleId === sampleStatus.sampleId)
        .length !== 0;
    const newSample = {
        sampleName: sampleStatus.sampleName,
        done: 0,
        sampleId: sampleStatus.sampleId,
        estimationParam: sampleStatus.estimationParam,
    };
    if (!sampleExist) {
        await fs_extra_1.default.writeJSON(dataFilePath, {
            sampleStatusList: [newSample].concat(prevSampleStatusList),
        }, {
            spaces: 2,
        });
    }
    else {
        await fs_extra_1.default.writeJSON(dataFilePath, {
            sampleStatusList: prevSampleStatusList.map(l => {
                if (l.sampleId === sampleStatus.sampleId) {
                    return {
                        sampleName: sampleStatus.sampleName,
                        done: 0,
                        sampleId: l.sampleId,
                        estimationParam: l.estimationParam === undefined
                            ? sampleStatus.estimationParam
                            : l.estimationParam,
                    };
                }
                else {
                    return l;
                }
            }),
        }, {
            spaces: 2,
        });
    }
    const NewSampleStatusList = await loadSampleListFromJSON();
    return NewSampleStatusList;
};
const saveAgeDataToDB = async (ageData) => {
    await (0, dbConnection_1.dbRun)(`create table if not exists ageData 
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), age numeric(10), sd numeric(10))
  `).catch((err) => {
        console.error(err);
        throw Error;
    });
    const sampleId = ageData.sampleId;
    for (const { age, sd } of ageData.data) {
        await (0, dbConnection_1.dbRun)('INSERT INTO ageData VALUES (null,?,?,?)', sampleId, age, sd).catch((err) => {
            console.error(err);
            throw Error;
        });
    }
};
const deleteAgeDataFromDB = async (sampleId) => {
    await (0, dbConnection_1.dbRun)(`delete from ageData where sampleId='${sampleId}'`).catch((err) => {
        console.error(err);
        throw Error;
    });
    await (0, dbConnection_1.dbRun)(`delete from bootstrapPeaks where sampleId='${sampleId}'`).catch((err) => {
        console.error(err);
        throw Error;
    });
    await (0, dbConnection_1.dbRun)(`delete from densityCrossValidation where sampleId='${sampleId}'`).catch((err) => {
        console.error(err);
        throw Error;
    });
    await (0, dbConnection_1.dbRun)(`delete from baseDensity where sampleId='${sampleId}'`).catch((err) => {
        console.error(err);
        throw Error;
    });
    await (0, dbConnection_1.dbRun)(`delete from densityCi where sampleId='${sampleId}'`).catch((err) => {
        console.error(err);
        throw Error;
    });
    await (0, dbConnection_1.dbRun)(`delete from peaksCertainty where sampleId='${sampleId}'`).catch((err) => {
        console.error(err);
        throw Error;
    });
};
const deleteSampleFromJSON = async (sampleId) => {
    const sampleStatusList = await loadSampleListFromJSON();
    await fs_extra_1.default.writeJSON(dataFilePath, {
        sampleStatusList: sampleStatusList.filter(d => {
            return d.sampleId !== sampleId;
        }),
    }, {
        spaces: 2,
    });
};
const loadAgeDataFromDB = async (sampleId) => {
    return new Promise((resolve, reject) => {
        (0, dbConnection_1.dbAll)(`SELECT * FROM ageData where sampleId = '${sampleId}'`)
            .then((rows) => {
            resolve(rows.map(d => ({ age: d.age, sd: d.sd })));
        })
            .catch((e) => {
            console.error(e);
            throw Error;
        });
    });
};
const core = {
    restartElectronApp: exports.restartElectronApp,
    watchFileEvent,
    // getInitialSetupData,
    // saveInitialSetupData,
    saveAsPDF,
    loadSampleListFromJSON,
    saveSampleListToJSON,
    deleteSampleFromJSON,
    saveAgeDataToDB,
    loadAgeDataFromDB,
    deleteAgeDataFromDB,
    toggleDoneSampleListFromJSON,
};
exports.default = core;
//# sourceMappingURL=core.js.map