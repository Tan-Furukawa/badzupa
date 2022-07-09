import { ChildProcess } from 'child_process';
import { IAge, IAgeData } from '../states/IData';
import { ISampleStatus } from './../states/IData';

export default interface ICore {
  restartElectronApp: () => void;
  watchFileEvent: (path: string, callback: (content: string) => void) => void;
  // getInitialSetupData: () => Promise<0 | 1>;
  // saveInitialSetupData: (done: 0 | 1) => void;
  saveAsPDF: (str: string) => void;
  loadSampleListFromJSON: () => Promise<ISampleStatus[]>;
  // saveSampleToDB: (ageData: IAgeData) => Promise<ISampleStatus[]>;
  toggleDoneSampleListFromJSON: (sampleId: string) => Promise<void>;
  saveSampleListToJSON: (
    sampleStatusList: ISampleStatus,
  ) => Promise<ISampleStatus[]>;
  deleteSampleFromJSON: (id: string) => Promise<void>;
  saveAgeDataToDB: (id: IAgeData) => Promise<void>;
  loadAgeDataFromDB: (sampleId: string) => Promise<IAge[]>;
  deleteAgeDataFromDB: (sampleId: string) => Promise<void>;
}

declare global {
  interface Window {
    core: ICore;
  }
}
