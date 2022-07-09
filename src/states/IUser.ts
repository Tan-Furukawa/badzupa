import { GridElement } from '../components/RegisterView';
import { IEstimationParam } from './IData';
import { algorithm } from './IR';
/**
 * ユーザー定義
 */

export interface IFailedMessage {
  id: string;
  msg: string;
  status: 'error' | 'warning';
}

export type IGetDbStatus = 'failed' | 'exists' | 'notExists';

export interface IDensityEstimationResultDisplay {
  sampleId: string;
  showCDF?: boolean;
  showHistogram?: boolean;
  displayStrokeColorPicker?: boolean;
  displayBgColorPicker?: boolean;
  xmin?: number;
  xmax?: number;
  bgColor?: string;
  strokeColor?: string;
}

export interface IAlgorithmInfo {
  algorithm: algorithm;
  used: boolean;
}

export interface IProgress {
  index: number;
  all: number;
}

export default interface IUser {
  /** 名前 */
  name: string;
  /** カウント */
  count: number;
  nowDisplay: string;
  nowSelectDataLoadingMethod: string;
  nowSelectIsotopeData: string;
  loadedData: GridElement[][];
  loadingBy: 'grid' | 'csv';
  sampleName: string;
  loading: boolean;
  failedMessage: IFailedMessage[];
  densityEstimationResultDisplay: IDensityEstimationResultDisplay[];
  estimationParamInput: IEstimationParam;
  crossValidationProgress: IProgress;
  bootstrapProgress: IProgress;
  mdsProgress: IProgress;
  nowComputation: boolean;
  // initialSetupDone: boolean;
}
