import { actionCreatorFactory } from 'typescript-fsa';
import '../core/ICore';
import { algorithm } from '../states/IR';
import {
  IBootstrapResult,
  ICoordinate,
  ICrossValidationResult,
} from '../states/IData';

const actionCreator = actionCreatorFactory('saga-action');

export const registerCrossValidationAction = actionCreator<{
  sampleId: string;
  crossValidationResult: ICrossValidationResult[];
}>('register-cv-action');

export const registerBestAlgorithmAction = actionCreator<{
  algorithm: algorithm;
  sampleId: string;
}>('register-best-alogrithm');

export const registerBaseDensityEstimationResultAction = actionCreator<{
  sampleId: string;
  baseDensityResult: ICoordinate[];
}>('register-base-density-result-action');

export const registerBootstrapResultAction = actionCreator<{
  sampleId: string;
  bootstrapResult: IBootstrapResult;
}>('register-bootstrap-result');
