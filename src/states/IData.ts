import { IAlgorithmInfo, IFailedMessage } from '../states/IUser';
import { algorithm } from './IR';

export interface IAgeData {
  sampleId: string;
  data: {
    age: number;
    sd: number;
  }[];
}

export interface IAge {
  age: number;
  sd: number;
}

export type ICrossValidationResult = {
  index: number;
  algorithm: algorithm;
  score: number;
};

export interface ICoordinate {
  x: number;
  y: number;
}

export interface ICoordinateId extends ICoordinate {
  id: number;
}

export interface IPeaksCertainty {
  mean: number;
  sd: number;
  certainty: number;
  prominence: number;
  y: number;
}

export interface IBootstrapPeaksCoordinate {
  id: number;
  x: number;
  y: number;
  prominence: number;
}

export interface ICi {
  x: number;
  upperCi: number;
  lowerCi: number;
}

export interface IBootstrapResult {
  ci: ICi[];
  bootstrapPeaks: IBootstrapPeaksCoordinate[];
  peaksCertainty: IPeaksCertainty[];
}

export interface IEachFinishStatus {
  crossValidation: boolean;
  baseDensityEstimation: boolean;
  bootstrap: boolean;
}

// 未完の時はnul
export interface IDensityEstimation {
  sampleId: string;
  data: IAge[];
  isFinished: boolean;
  bestAlgorithm?: algorithm;
  cvScores?: ICrossValidationResult[];
  density?: ICoordinate[];
  bootstrapResult?: IBootstrapResult;
}

export interface IEstimationParam {
  bootstrapSize: number;
  usedAlgorithmList: IAlgorithmInfo[];
  densityEstimationConfidentLevel: number;
  crossValidationSize: number;
}

export interface ISampleStatus {
  // id: number;
  sampleName: string;
  done: 0 | 1;
  sampleId: string;
  selected?: boolean;
  estimationParam?: IEstimationParam;
}

export interface IMdsEstimation {
  dataList: IAgeData[];
  NBootstrap: number;
  ci: number;
  centerCoordinate?: ICoordinateId[];
  ellipseCoordinate?: ICoordinateId[];
  bootstrapCoordinate?: ICoordinateId[];
}

export default interface IData {
  sampleStatusList: ISampleStatus[];
  failedMessage: IFailedMessage[];
  loading: boolean;
  // 表示しているやつのdensityEstimationの結果
  densityEstimationResult: IDensityEstimation[];
  msdResult: IMdsEstimation;
}
