"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const r_script_1 = __importDefault(require("r-script"));
// import R from 'r-script';
const params_1 = require("../params");
const dbConnection_1 = require("./dbConnection");
const fix_path_1 = __importDefault(require("fix-path"));
const crossValidation = async (data, crossValidationSize, algorithmList) => {
    (0, fix_path_1.default)();
    return new Promise((resolve, reject) => {
        // try {
        // console.log(`${topDir}/algorithm/R/crossValidation.r`);
        // console.log(process.env);
        // exec(`echo $PATH`, (err, stdout) => {
        //   if (err != null) {
        //     console.log(err);
        //   } else {
        //     console.log(stdout);
        //   }
        // });
        // console.log(`${topDir}/algorithm/R/crossValidation.r`);
        const child = (0, r_script_1.default)(`${params_1.topDir}/algorithm/R/crossValidation.r`)
            // dataにはdirを渡す！！！
            .data({
            dir: params_1.rMsgDir,
            data: data,
            cvN: crossValidationSize,
            algorithmList: algorithmList,
        })
            .call((err, d) => {
            if (err) {
                const errMsg = new TextDecoder().decode(err);
                console.error(errMsg);
                reject({ err: errMsg, status: 'error-at-r-file' });
            }
            else {
                console.log('cv done');
                resolve(d);
            }
        });
        child.on('error', (err) => {
            reject({ err: err, status: 'error-at-child-process' });
        });
        try {
            global.childProcessList.push(child);
        }
        catch (e) {
            reject({ err: e, status: 'error-at-add-child-process' });
            console.error(e);
        }
        // } catch (e) {
        //   reject(e);
        //   console.log(e);
        // }
    });
};
const baseDensityEstimation = async (params) => {
    return new Promise((resolve, reject) => {
        try {
            const child = (0, r_script_1.default)(`${params_1.topDir}/algorithm/R/baseDensityEstimation.r`)
                // dataにはdirを渡す！！！
                // .data({ dir: rMsgDir, data: params.data, algorithm: params.algorithm })
                .data({ dir: params_1.rMsgDir, data: params.data, algorithm: params.algorithm })
                .call((err, d) => {
                if (err) {
                    console.log('get error in base density estimation');
                    const errMsg = new TextDecoder().decode(err);
                    console.error(errMsg);
                    reject(err);
                }
                else {
                    // !文字で送らないとバグる
                    const res = d
                        .map((dat) => {
                        return {
                            x: Number(dat.x),
                            y: Number(dat.y),
                        };
                    })
                        .sort((a, b) => a.x - b.x);
                    console.log('base density estimation done');
                    resolve(res);
                }
            });
            try {
                global.childProcessList.push(child);
            }
            catch (e) {
                console.error(e);
            }
        }
        catch (e) {
            console.error(e);
        }
    });
};
const bootstrap = async (params) => {
    return new Promise((resolve, reject) => {
        const child = (0, r_script_1.default)(`${params_1.topDir}/algorithm/R/bootstrap.r`)
            // dataにはdirを渡す！！！
            // .data({ dir: rMsgDir, data: params.data, algorithm: params.algorithm })
            .data({
            dir: params_1.rMsgDir,
            data: params.data,
            algorithm: params.algorithm,
            Nbootstrap: params.bootstrapSize,
            confidentLevel: params.confidentLevel,
        })
            .call((err, d) => {
            if (err) {
                const errMsg = new TextDecoder().decode(err);
                console.error(errMsg);
                reject(err);
            }
            else {
                const resCi = d.ci
                    .map((dat) => {
                    return {
                        x: Number(dat.x),
                        upperCi: Number(dat.upperCi),
                        lowerCi: Number(dat.lowerCi),
                    };
                })
                    .sort((a, b) => a.x - b.x);
                const resBootstrapPeaks = d.bootstrapPeaks.map((p) => {
                    return {
                        id: Number(p.id),
                        x: Number(p.x),
                        y: Number(p.y),
                        prominence: Number(p.prominence),
                    };
                });
                const resPeaksCertainty = d.peaksCertainty.map((p) => {
                    return {
                        mean: Number(p.mean),
                        sd: Number(p.sd),
                        certainty: Number(p.certainty),
                        prominence: Number(p.prominence),
                        y: Number(p.y),
                    };
                });
                console.log('bootstrap done');
                resolve({
                    peaksCertainty: resPeaksCertainty,
                    bootstrapPeaks: resBootstrapPeaks,
                    ci: resCi,
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
const createTables = async () => {
    await (0, dbConnection_1.dbRun)(`create table if not exists baseDensity 
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), x number(10), y number(10))
    `).catch((err) => {
        console.error(err);
        throw Error;
    });
    await (0, dbConnection_1.dbRun)(`create table if not exists densityCrossValidation
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), algorithm varchar(100),i number(10), score number(10))
    `).catch((err) => {
        console.error(err);
        throw Error;
    });
    await (0, dbConnection_1.dbRun)(`create table if not exists bootstrapPeaks
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100),i number(10), x number(10), y number(10), prominence number(10))
    `).catch((err) => {
        console.error(err);
        throw Error;
    });
    await (0, dbConnection_1.dbRun)(`create table if not exists densityCi
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), x number(10), lowerCi number(10), upperCi number(10))
    `).catch((err) => {
        console.error(err);
        throw Error;
    });
    await (0, dbConnection_1.dbRun)(`create table if not exists peaksCertainty
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), certainty number(10), mean number(10), prominence number(10), sd number(10), y number(10))
    `).catch((err) => {
        console.error(err);
        throw Error;
    });
};
const saveBaseDensity = async (data, sampleId) => {
    for (let i = 0; i < data.length; i++) {
        await (0, dbConnection_1.dbRun)(`
      INSERT INTO baseDensity VALUES (null,'${sampleId}',${data[i].x},${data[i].y})
      `).catch((err) => {
            console.error(err);
            throw Error;
        });
    }
};
const deleteBaseDensity = async (sampleId) => {
    await (0, dbConnection_1.dbRun)(`delete from baseDensity where sampleId='${sampleId}'`).catch((err) => {
        console.error(err);
        throw Error;
    });
};
const selectBaseDensity = async (sampleId) => {
    return new Promise((resolve, reject) => {
        (0, dbConnection_1.dbAll)(`SELECT * FROM baseDensity where sampleId = '${sampleId}'`)
            .then((rows) => {
            resolve(rows.map(r => ({ x: r.x, y: r.y })));
        })
            .catch((e) => {
            console.error(e);
            throw Error;
        });
    });
};
const saveCrossValidationResult = async (data, sampleId) => {
    await (0, dbConnection_1.dbInsert)('INSERT INTO densityCrossValidation VALUES (null, ?, ?, ?, ?)', data.map(d => {
        return [sampleId, d.algorithm, d.index, d.score];
    }));
};
const deleteCrossValidationResult = async (sampleId) => {
    await (0, dbConnection_1.dbRun)(`delete from densityCrossValidation where sampleId='${sampleId}'`).catch((err) => {
        console.error(err);
        throw Error;
    });
};
const selectCrossValidationResult = async (sampleId) => {
    return new Promise((resolve, reject) => {
        (0, dbConnection_1.dbAll)(`SELECT * FROM densityCrossValidation where sampleId = '${sampleId}'`)
            .then((rows) => {
            resolve(rows.map(r => ({
                index: r.i,
                algorithm: r.algorithm,
                score: r.score,
            })));
        })
            .catch((e) => {
            console.log(e);
            throw Error;
        });
    });
};
const saveBootstrapPeaks = async (data, sampleId) => {
    await (0, dbConnection_1.dbInsert)('INSERT INTO bootstrapPeaks VALUES (null, ?, ?, ?, ?, ?)', data.map(d => {
        return [sampleId, d.id, d.x, d.y, d.prominence];
    }));
    // for (let i = 0; i < data.length; i++) {
    //   await dbRun(
    //     `
    //     INSERT INTO bootstrapPeaks VALUES (null, '${sampleId}',' ${data[i].id}', ${data[i].x}, ${data[i].y}, ${data[i].prominence})
    //     `,
    //   ).catch((err: Error) => {
    //     console.log(err);
    //     throw Error;
    //   });
    // }
};
const deleteBootstrapPeaks = async (sampleId) => {
    await (0, dbConnection_1.dbRun)(`delete from bootstrapPeaks where sampleId='${sampleId}'`).catch((err) => {
        console.log(err);
        throw Error;
    });
};
const selectBootstrapPeaks = async (sampleId) => {
    return new Promise((resolve, reject) => {
        (0, dbConnection_1.dbAll)(`SELECT * FROM bootstrapPeaks where sampleId = '${sampleId}'`)
            .then((rows) => {
            resolve(rows.map(r => ({
                id: r.i,
                x: r.x,
                y: r.y,
                prominence: r.prominence,
            })));
        })
            .catch((e) => {
            console.log(e);
            throw Error;
        });
    });
};
const saveDensityCi = async (data, sampleId) => {
    await (0, dbConnection_1.dbInsert)('INSERT INTO densityCi VALUES (null, ?, ?, ?, ?)', data.map(d => {
        return [sampleId, d.x, d.lowerCi, d.upperCi];
    }));
    // for (let i = 0; i < data.length; i++) {
    //   await dbRun(
    //     `
    //     INSERT INTO densityCi VALUES (null, '${sampleId}', ${data[i].x}, ${data[i].lowerCi}, ${data[i].upperCi})
    //     `,
    //   ).catch((err: Error) => {
    //     console.log(err);
    //     throw Error;
    //   });
    // }
};
const deleteDensityCi = async (sampleId) => {
    await (0, dbConnection_1.dbRun)(`delete from densityCi where sampleId='${sampleId}'`).catch((err) => {
        console.log(err);
        throw Error;
    });
};
const selectDensityCi = async (sampleId) => {
    return new Promise((resolve, reject) => {
        (0, dbConnection_1.dbAll)(`SELECT * FROM densityCi where sampleId = '${sampleId}'`)
            .then((rows) => {
            resolve(rows.map(r => ({
                x: r.x,
                upperCi: r.upperCi,
                lowerCi: r.lowerCi,
            })));
        })
            .catch((e) => {
            console.log(e);
            throw Error;
        });
    });
};
const savePeaksCertainty = async (data, sampleId) => {
    await (0, dbConnection_1.dbInsert)('INSERT INTO peaksCertainty VALUES (null, ?, ?, ?, ?, ?, ?)', data.map(d => {
        return [sampleId, d.certainty, d.mean, d.prominence, d.sd, d.y];
    }));
};
const deletePeaksCertainty = async (sampleId) => {
    await (0, dbConnection_1.dbRun)(`delete from peaksCertainty where sampleId='${sampleId}'`).catch((err) => {
        console.error(err);
        throw Error;
    });
};
const selectPeaksCertainty = async (sampleId) => {
    return new Promise((resolve, reject) => {
        (0, dbConnection_1.dbAll)(`SELECT * FROM peaksCertainty where sampleId = '${sampleId}'`)
            .then((rows) => {
            resolve(rows.map(r => ({
                certainty: r.certainty,
                mean: r.mean,
                prominence: r.prominence,
                sd: r.sd,
                y: r.y,
            })));
        })
            .catch((e) => {
            console.error(e);
            throw Error;
        });
    });
};
const densityEstimationR = {
    crossValidation,
    baseDensityEstimation,
    bootstrap,
    createTables,
    saveBaseDensity,
    deleteBaseDensity,
    selectBaseDensity,
    saveCrossValidationResult,
    deleteCrossValidationResult,
    selectCrossValidationResult,
    saveBootstrapPeaks,
    deleteBootstrapPeaks,
    selectBootstrapPeaks,
    saveDensityCi,
    deleteDensityCi,
    selectDensityCi,
    savePeaksCertainty,
    deletePeaksCertainty,
    selectPeaksCertainty,
};
exports.default = densityEstimationR;
//# sourceMappingURL=densityEstimationR.js.map