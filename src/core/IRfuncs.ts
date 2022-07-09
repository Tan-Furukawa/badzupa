import {
  IAge,
  IBootstrapPeaksCoordinate,
  IBootstrapResult,
  ICi,
  ICoordinate,
  ICrossValidationResult,
  IMdsEstimation,
  IPeaksCertainty,
} from '../states/IData';
import { algorithm } from '../states/IR';

export default interface IDensityEstimationR {
  crossValidation: (
    data: IAge[],
    crossValidationSize: number,
    algorithmList: algorithm[],
  ) => Promise<ICrossValidationResult[]>;
  baseDensityEstimation: (params: {
    data: IAge[];
    algorithm: algorithm;
  }) => Promise<ICoordinate[]>;
  bootstrap: (params: {
    data: IAge[];
    algorithm: algorithm;
    bootstrapSize: number;
    confidentLevel: number;
  }) => Promise<IBootstrapResult>;
  createTables: () => Promise<void>;
  saveBaseDensity: (data: ICoordinate[], sampleId: string) => Promise<void>;
  deleteBaseDensity: (sampleId: string) => Promise<void>;
  selectBaseDensity: (sampleId: string) => Promise<ICoordinate[]>;
  saveCrossValidationResult: (
    data: ICrossValidationResult[],
    sampleId: string,
  ) => Promise<void>;
  deleteCrossValidationResult: (sampleId: string) => Promise<void>;
  selectCrossValidationResult: (
    sampleId: string,
  ) => Promise<ICrossValidationResult[]>;
  saveBootstrapPeaks: (
    data: IBootstrapPeaksCoordinate[],
    sampleId: string,
  ) => Promise<void>;
  deleteBootstrapPeaks: (sampleId: string) => Promise<void>;
  selectBootstrapPeaks: (
    sampleId: string,
  ) => Promise<IBootstrapPeaksCoordinate[]>;
  saveDensityCi: (data: ICi[], sampleId: string) => Promise<void>;
  deleteDensityCi: (sampleId: string) => Promise<void>;
  selectDensityCi: (sampleId: string) => Promise<ICi[]>;

  savePeaksCertainty: (
    data: IPeaksCertainty[],
    sampleId: string,
  ) => Promise<void>;
  deletePeaksCertainty: (sampleId: string) => Promise<void>;
  selectPeaksCertainty: (sampleId: string) => Promise<IPeaksCertainty[]>;
}

export interface IMdsEstimationR {
  mds: (mdsParams: IMdsEstimation) => Promise<IMdsEstimation>;
}

export interface IInitialSetupFunction {
  installPackages: () => Promise<void>;
  checkRscript: () => Promise<boolean>;
}

declare global {
  interface Window {
    densityEstimationR: IDensityEstimationR;
    mdsEstimationR: IMdsEstimationR;
  }
}
