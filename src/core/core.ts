import shortid from 'shortid';
import { IAge, IAgeData, IEstimationParam } from '../states/IData';
import ICore from './ICore';
import { dbAll, dbRun } from './dbConnection';
import { ISampleStatus } from '../states/IData';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import blobStream from 'blob-stream';
import { viewParam } from '../components/plot/config';
import os from 'os';
import path from 'path';
import { topDir } from '../params';
import fs from 'fs-extra';
import * as chokidar from 'chokidar';
import { app } from 'electron';

export const restartElectronApp = () => {
  global.childProcessList.forEach(childProcess => {
    childProcess.kill('SIGINT');
  });
  global.childProcessList = [];
  location.reload();
  // app.relaunch();
  // app.quit();
};

const dataFilePath = path.join(`${topDir}/data`, `sampleList.json`);

// const initialSetupPath = path.join(`${topDir}/data`, `initialSetup.json`);

interface IInitialSetup {
  initialSetupStatus: 0 | 1;
}

const watchFileEvent = (path: string, callback: (content: string) => void) => {
  const watcher = chokidar.watch(`${topDir}/${path}`, {
    ignored: /[\\/\\\\]\./,
    persistent: true,
  });

  watcher.on('ready', () => {
    watcher.on('change', async pathName => {
      const content = fs.readFileSync(pathName, 'utf8');
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

const saveAsPDF = (str: string): void => {
  const doc = new PDFDocument({
    bufferPages: true,
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${viewParam.width} ${viewParam.height}">
  ${str} </svg>`;

  const stream = doc.pipe(blobStream());
  SVGtoPDF(doc, svg, 0, 0);
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

const loadSampleListFromJSON = async (): Promise<ISampleStatus[]> => {
  const exist = await fs.pathExists(dataFilePath); // ...(b)
  if (!exist) {
    // ...(c)
    // データファイルがなけれが、ファイルを作成して、初期データを保存する
    fs.ensureFileSync(dataFilePath);
    await fs.writeJSON(dataFilePath, { sampleStatusList: [] });
  }
  const jsonData = (await fs.readJSON(dataFilePath)) as {
    sampleStatusList: ISampleStatus[];
  };
  return jsonData.sampleStatusList;
};

const toggleDoneSampleListFromJSON = async (
  sampleId: string,
): Promise<void> => {
  const jsonData = (await fs.readJSON(dataFilePath)) as {
    sampleStatusList: ISampleStatus[];
  };
  await fs.writeJSON(
    dataFilePath,
    {
      sampleStatusList: jsonData.sampleStatusList.map(d => {
        return d.sampleId === sampleId ? { ...d, done: 1 } : d;
      }),
    },
    {
      spaces: 2,
    },
  );
};

const saveSampleListToJSON = async (
  sampleStatus: ISampleStatus,
  // ageData: IAgeData,
  // estimationParam?: IEstimationParam,
): Promise<ISampleStatus[]> => {
  const prevSampleStatusList: ISampleStatus[] = await loadSampleListFromJSON();
  const sampleExist =
    prevSampleStatusList.filter(s => s.sampleId === sampleStatus.sampleId)
      .length !== 0;
  const newSample: ISampleStatus = {
    sampleName: sampleStatus.sampleName,
    done: 0,
    sampleId: sampleStatus.sampleId,
    estimationParam: sampleStatus.estimationParam,
  };

  if (!sampleExist) {
    await fs.writeJSON(
      dataFilePath,
      {
        sampleStatusList: [newSample].concat(prevSampleStatusList),
      },
      {
        spaces: 2,
      },
    );
  } else {
    await fs.writeJSON(
      dataFilePath,
      {
        sampleStatusList: prevSampleStatusList.map(l => {
          if (l.sampleId === sampleStatus.sampleId) {
            return {
              sampleName: sampleStatus.sampleName,
              done: 0,
              sampleId: l.sampleId,
              estimationParam:
                l.estimationParam === undefined
                  ? sampleStatus.estimationParam
                  : l.estimationParam,
            };
          } else {
            return l;
          }
        }),
      },
      {
        spaces: 2,
      },
    );
  }

  const NewSampleStatusList = await loadSampleListFromJSON();
  return NewSampleStatusList;
};

const saveAgeDataToDB = async (ageData: IAgeData): Promise<void> => {
  await dbRun(`create table if not exists ageData 
    (id INTEGER PRIMARY KEY NOT NULL, sampleId varchar(100), age numeric(10), sd numeric(10))
  `).catch((err: Error) => {
    console.error(err);
    throw Error;
  });

  const sampleId = ageData.sampleId;

  for (const { age, sd } of ageData.data) {
    await dbRun(
      'INSERT INTO ageData VALUES (null,?,?,?)',
      sampleId,
      age,
      sd,
    ).catch((err: Error) => {
      console.error(err);
      throw Error;
    });
  }
};

const deleteAgeDataFromDB = async (sampleId: string): Promise<void> => {
  await dbRun(`delete from ageData where sampleId='${sampleId}'`).catch(
    (err: Error) => {
      console.error(err);
      throw Error;
    },
  );
};

const deleteSampleFromJSON = async (sampleId: string): Promise<void> => {
  const sampleStatusList: ISampleStatus[] = await loadSampleListFromJSON();
  await fs.writeJSON(
    dataFilePath,
    {
      sampleStatusList: sampleStatusList.filter(d => {
        return d.sampleId !== sampleId;
      }),
    },
    {
      spaces: 2,
    },
  );
};

interface IAgeDataList extends IAge {
  id: number;
  sampleId: string;
}

const loadAgeDataFromDB = async (sampleId: string): Promise<IAge[]> => {
  return new Promise((resolve, reject) => {
    dbAll<IAgeDataList[]>(
      `SELECT * FROM ageData where sampleId = '${sampleId}'`,
    )
      .then((rows: IAgeDataList[]) => {
        resolve(rows.map(d => ({ age: d.age, sd: d.sd })));
      })
      .catch((e: Error) => {
        console.error(e);
        throw Error;
      });
  });
};

const core: ICore = {
  restartElectronApp,
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

export default core;
