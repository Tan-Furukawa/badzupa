/* eslint-disable prefer-promise-reject-errors */
import IDensityEstimationR from './IRfuncs';
import R from 'r-script';
// import R from 'r-script';
import { rMsgDir, topDir } from '../params';
import {
  IAge,
  IBootstrapPeaksCoordinate,
  IBootstrapResult,
  ICi,
  ICoordinate,
  ICrossValidationResult,
  IPeaksCertainty,
} from '../states/IData';
import { algorithm } from '../states/IR';
import { dbAll, dbInsert, dbRun } from './dbConnection';
import { exec } from 'child_process';
import fixPath from 'fix-path';
import ICore from './ICore';

const crossValidation = async (
  data: IAge[],
  crossValidationSize: number,
  algorithmList: algorithm[],
): Promise<ICrossValidationResult[]> => {
  fixPath();
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
    const child = R(`${topDir}/algorithm/R/crossValidation.r`)
      // dataにはdirを渡す！！！
      .data({
        dir: rMsgDir,
        data: data,
        cvN: crossValidationSize,
        algorithmList: algorithmList,
      })
      .call((err: any, d: any) => {
        if (err) {
          const errMsg = new TextDecoder().decode(err);
          console.error(errMsg);
          reject({ err: errMsg, status: 'error-at-r-file' });
        } else {
          console.log('cv done');
          resolve(d as ICrossValidationResult[]);
        }
      });

    child.on('error', (err: any) => {
      reject({ err: err, status: 'error-at-child-process' });
    });

    try {
      global.childProcessList.push(child);
    } catch (e) {
      reject({ err: e, status: 'error-at-add-child-process' });
      console.error(e);
    }
    // } catch (e) {
    //   reject(e);
    //   console.log(e);
    // }
  });
};

const baseDensityEstimation = async (params: {
  data: IAge[];
  algorithm: algorithm;
}): Promise<ICoordinate[]> => {
  return new Promise((resolve, reject) => {
    try {
      const child = R(`${topDir}/algorithm/R/baseDensityEstimation.r`)
        // dataにはdirを渡す！！！
        // .data({ dir: rMsgDir, data: params.data, algorithm: params.algorithm })
        .data({ dir: rMsgDir, data: params.data, algorithm: params.algorithm })
        .call((err: any, d: any) => {
          if (err) {
            console.log('get error in base density estimation');
            const errMsg = new TextDecoder().decode(err);
            console.error(errMsg);
            reject(err);
          } else {
            // !文字で送らないとバグる
            const res = d
              .map((dat: { x: string; y: string }) => {
                return {
                  x: Number(dat.x),
                  y: Number(dat.y),
                };
              })
              .sort((a: ICoordinate, b: ICoordinate) => a.x - b.x);
            console.log('base density estimation done');
            resolve(res as ICoordinate[]);
          }
        });
      try {
        global.childProcessList.push(child);
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    }
  });
};

const bootstrap = async (params: {
  data: IAge[];
  algorithm: algorithm;
  bootstrapSize: number;
  confidentLevel: number;
}): Promise<IBootstrapResult> => {
  return new Promise((resolve, reject) => {
    const child = R(`${topDir}/algorithm/R/bootstrap.r`)
      // dataにはdirを渡す！！！
      // .data({ dir: rMsgDir, data: params.data, algorithm: params.algorithm })
      .data({
        dir: rMsgDir,
        data: params.data,
        algorithm: params.algorithm,
        Nbootstrap: params.bootstrapSize,
        confidentLevel: params.confidentLevel,
      })
      .call((err: any, d: any) => {
        if (err) {
          const errMsg = new TextDecoder().decode(err);
          console.error(errMsg);
          reject(err);
        } else {
          const resCi = d.ci
            .map((dat: { x: string; upperCi: string; lowerCi: string }) => {
              return {
                x: Number(dat.x),
                upperCi: Number(dat.upperCi),
                lowerCi: Number(dat.lowerCi),
              };
            })
            .sort((a: ICoordinate, b: ICoordinate) => a.x - b.x);

          const resBootstrapPeaks: IBootstrapPeaksCoordinate[] =
            d.bootstrapPeaks.map(
              (p: { id: string; x: string; y: string; prominence: string }) => {
                return {
                  id: Number(p.id),
                  x: Number(p.x),
                  y: Number(p.y),
                  prominence: Number(p.prominence),
                };
              },
            );

          const resPeaksCertainty: IPeaksCertainty[] = d.peaksCertainty.map(
            (p: {
              mean: string;
              sd: string;
              certainty: string;
              prominence: string;
              y: string;
            }) => {
              return {
                mean: Number(p.mean),
                sd: Number(p.sd),
                certainty: Number(p.certainty),
                prominence: Number(p.prominence),
                y: Number(p.y),
              };
            },
          );
          console.log('bootstrap done');
          resolve({
            peaksCertainty: resPeaksCertainty,
            bootstrapPeaks: resBootstrapPeaks,
            ci: resCi,
          } as IBootstrapResult);
        }
      });
    try {
      global.childProcessList.push(child);
    } catch (e) {
      console.error(e);
    }
  });
};

const createTables = async (): Promise<void> => {
  await dbRun(
    `create table if not exists baseDensity 
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), x number(10), y number(10))
    `,
  ).catch((err: Error) => {
    console.error(err);
    throw Error;
  });
  await dbRun(
    `create table if not exists densityCrossValidation
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), algorithm varchar(100),i number(10), score number(10))
    `,
  ).catch((err: Error) => {
    console.error(err);
    throw Error;
  });
  await dbRun(
    `create table if not exists bootstrapPeaks
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100),i number(10), x number(10), y number(10), prominence number(10))
    `,
  ).catch((err: Error) => {
    console.error(err);
    throw Error;
  });
  await dbRun(
    `create table if not exists densityCi
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), x number(10), lowerCi number(10), upperCi number(10))
    `,
  ).catch((err: Error) => {
    console.error(err);
    throw Error;
  });
  await dbRun(
    `create table if not exists peaksCertainty
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), certainty number(10), mean number(10), prominence number(10), sd number(10), y number(10))
    `,
  ).catch((err: Error) => {
    console.error(err);
    throw Error;
  });
};

const saveBaseDensity = async (
  data: ICoordinate[],
  sampleId: string,
): Promise<void> => {
  for (let i = 0; i < data.length; i++) {
    await dbRun(
      `
      INSERT INTO baseDensity VALUES (null,'${sampleId}',${data[i].x},${data[i].y})
      `,
    ).catch((err: Error) => {
      console.error(err);
      throw Error;
    });
  }
};

const deleteBaseDensity = async (sampleId: string): Promise<void> => {
  await dbRun(`delete from baseDensity where sampleId='${sampleId}'`).catch(
    (err: Error) => {
      console.error(err);
      throw Error;
    },
  );
};

interface ISelectedBaseDensityData {
  id: number;
  sampleId: string;
  x: number;
  y: number;
}

const selectBaseDensity = async (sampleId: string): Promise<ICoordinate[]> => {
  return new Promise((resolve, reject) => {
    dbAll<ISelectedBaseDensityData[]>(
      `SELECT * FROM baseDensity where sampleId = '${sampleId}'`,
    )
      .then((rows: ISelectedBaseDensityData[]) => {
        resolve(rows.map(r => ({ x: r.x, y: r.y })));
      })
      .catch((e: Error) => {
        console.error(e);
        throw Error;
      });
  });
};

const saveCrossValidationResult = async (
  data: ICrossValidationResult[],
  sampleId: string,
): Promise<void> => {
  await dbInsert(
    'INSERT INTO densityCrossValidation VALUES (null, ?, ?, ?, ?)',
    data.map(d => {
      return [sampleId, d.algorithm, d.index, d.score];
    }),
  );
};

const deleteCrossValidationResult = async (sampleId: string): Promise<void> => {
  await dbRun(
    `delete from densityCrossValidation where sampleId='${sampleId}'`,
  ).catch((err: Error) => {
    console.error(err);
    throw Error;
  });
};

interface ISelectedCrossValidationResult {
  id: number;
  sampleId: string;
  algorithm: algorithm;
  i: number;
  score: number;
}

const selectCrossValidationResult = async (
  sampleId: string,
): Promise<ICrossValidationResult[]> => {
  return new Promise((resolve, reject) => {
    dbAll<ISelectedCrossValidationResult[]>(
      `SELECT * FROM densityCrossValidation where sampleId = '${sampleId}'`,
    )
      .then((rows: ISelectedCrossValidationResult[]) => {
        resolve(
          rows.map(r => ({
            index: r.i,
            algorithm: r.algorithm,
            score: r.score,
          })),
        );
      })
      .catch((e: Error) => {
        console.log(e);
        throw Error;
      });
  });
};

const saveBootstrapPeaks = async (
  data: IBootstrapPeaksCoordinate[],
  sampleId: string,
): Promise<void> => {
  await dbInsert(
    'INSERT INTO bootstrapPeaks VALUES (null, ?, ?, ?, ?, ?)',
    data.map(d => {
      return [sampleId, d.id, d.x, d.y, d.prominence];
    }),
  );
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

const deleteBootstrapPeaks = async (sampleId: string): Promise<void> => {
  await dbRun(`delete from bootstrapPeaks where sampleId='${sampleId}'`).catch(
    (err: Error) => {
      console.log(err);
      throw Error;
    },
  );
};

interface ISelectedBootstrapPeaks {
  id: number;
  sampleId: string;
  i: number;
  x: number;
  y: number;
  prominence: number;
}

const selectBootstrapPeaks = async (
  sampleId: string,
): Promise<IBootstrapPeaksCoordinate[]> => {
  return new Promise((resolve, reject) => {
    dbAll<ISelectedBootstrapPeaks[]>(
      `SELECT * FROM bootstrapPeaks where sampleId = '${sampleId}'`,
    )
      .then((rows: ISelectedBootstrapPeaks[]) => {
        resolve(
          rows.map(r => ({
            id: r.i,
            x: r.x,
            y: r.y,
            prominence: r.prominence,
          })),
        );
      })
      .catch((e: Error) => {
        console.log(e);
        throw Error;
      });
  });
};

const saveDensityCi = async (data: ICi[], sampleId: string): Promise<void> => {
  await dbInsert(
    'INSERT INTO densityCi VALUES (null, ?, ?, ?, ?)',
    data.map(d => {
      return [sampleId, d.x, d.lowerCi, d.upperCi];
    }),
  );

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

const deleteDensityCi = async (sampleId: string): Promise<void> => {
  await dbRun(`delete from densityCi where sampleId='${sampleId}'`).catch(
    (err: Error) => {
      console.log(err);
      throw Error;
    },
  );
};

interface ISelectedDensityCi {
  id: number;
  sampleId: string;
  x: number;
  upperCi: number;
  lowerCi: number;
}

const selectDensityCi = async (sampleId: string): Promise<ICi[]> => {
  return new Promise((resolve, reject) => {
    dbAll<ISelectedDensityCi[]>(
      `SELECT * FROM densityCi where sampleId = '${sampleId}'`,
    )
      .then((rows: ISelectedDensityCi[]) => {
        resolve(
          rows.map(r => ({
            x: r.x,
            upperCi: r.upperCi,
            lowerCi: r.lowerCi,
          })),
        );
      })
      .catch((e: Error) => {
        console.log(e);
        throw Error;
      });
  });
};

const savePeaksCertainty = async (
  data: IPeaksCertainty[],
  sampleId: string,
): Promise<void> => {
  await dbInsert(
    'INSERT INTO peaksCertainty VALUES (null, ?, ?, ?, ?, ?, ?)',
    data.map(d => {
      return [sampleId, d.certainty, d.mean, d.prominence, d.sd, d.y];
    }),
  );
};

const deletePeaksCertainty = async (sampleId: string): Promise<void> => {
  await dbRun(`delete from peaksCertainty where sampleId='${sampleId}'`).catch(
    (err: Error) => {
      console.error(err);
      throw Error;
    },
  );
};

interface ISelectedPeaksCertainty extends IPeaksCertainty {
  id: number;
  sampleId: string;
}

const selectPeaksCertainty = async (
  sampleId: string,
): Promise<IPeaksCertainty[]> => {
  return new Promise((resolve, reject) => {
    dbAll<ISelectedPeaksCertainty[]>(
      `SELECT * FROM peaksCertainty where sampleId = '${sampleId}'`,
    )
      .then((rows: ISelectedPeaksCertainty[]) => {
        resolve(
          rows.map(r => ({
            certainty: r.certainty,
            mean: r.mean,
            prominence: r.prominence,
            sd: r.sd,
            y: r.y,
          })),
        );
      })
      .catch((e: Error) => {
        console.error(e);
        throw Error;
      });
  });
};

const densityEstimationR: IDensityEstimationR = {
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
export default densityEstimationR;
