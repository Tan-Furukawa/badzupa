import {
  IBootstrapResult,
  ICoordinate,
  ICrossValidationResult,
} from '../states/IData';
import '../core/IRfuncs';
import { algorithm } from '../states/IR';
import { IState } from '../states/IState';
import { call, CallEffect, put, select } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
  registerBaseDensityEstimationResultAction,
  registerBestAlgorithmAction,
  registerBootstrapResultAction,
  registerCrossValidationAction,
} from '../actions/sagaAction';
import { mean } from 'simple-statistics';
import {
  registerNowComputation,
  sendFailedMessageAction,
} from '../actions/UserActions';
import { groupBy } from '../mylib/operation';

export function* safe(
  // effect: CallEffect<any>,
  effect: CallEffect<
    ICrossValidationResult[] | ICoordinate[] | IBootstrapResult
  >,
): SagaIterator<{ err: any; result: any }> {
  try {
    return { err: null, result: yield effect };
  } catch (err) {
    return { err: err, result: null };
  }
}

export function getBestAlgorithm(
  cvResult: ICrossValidationResult[],
): algorithm {
  const bestAlgorithm = groupBy(cvResult, r => r.algorithm)
    .map(([algorithm, scores]) => {
      return {
        algorithm: algorithm,
        score: mean(scores.map(s => s.score)),
      };
    })
    .reduce((prev, curr) => {
      return prev.score > curr.score ? curr : prev;
    });

  return bestAlgorithm.algorithm;
}

export function* setBestAlgorithm(sampleId: string) {
  const stateAfterCV: IState = yield select();
  const densityInfoAfterCV = stateAfterCV.data.densityEstimationResult.filter(
    d => d.sampleId === sampleId,
  )[0].cvScores;

  if (densityInfoAfterCV !== undefined) {
    const bestAlgorithm = getBestAlgorithm(densityInfoAfterCV);
    yield put(
      registerBestAlgorithmAction({
        algorithm: bestAlgorithm,
        sampleId: sampleId,
      }),
    );
  } else {
    yield put(
      sendFailedMessageAction({
        id: 'failed-to-get-best-algorithm',
        msg: 'failed to get best algorithm in cross validation',
        status: 'error',
      }),
    );
  }
}

export function* doCrossValidation(sampleId: string) {
  const state: IState = yield select();
  const densityInfo = state.data.densityEstimationResult.filter(
    d => d.sampleId === sampleId,
  )[0];

  const targetSampleStatusList = {
    ...state.data.sampleStatusList.find(d => d.sampleId == sampleId),
  };
  const crossValidationSize = { ...targetSampleStatusList.estimationParam }
    .crossValidationSize;
  const algorithmList = { ...targetSampleStatusList.estimationParam }
    .usedAlgorithmList;
  const usedAlgorithmList =
    algorithmList === undefined
      ? []
      : algorithmList.filter(d => d.used).map(d => d.algorithm);

  if (usedAlgorithmList.length === 0) {
    yield put(
      sendFailedMessageAction({
        id: 'algorithm-selection-error',
        msg: 'no algorithm is selected',
        status: 'error',
      }),
    );
  }

  const crossValidation: { err: any; result: ICrossValidationResult[] } =
    yield safe(
      call(
        window.densityEstimationR.crossValidation,
        densityInfo.data,
        crossValidationSize === undefined ? 10 : crossValidationSize,
        usedAlgorithmList,
      ),
    );

  console.log(crossValidation);

  if (!crossValidation.err) {
    yield put(
      registerCrossValidationAction({
        sampleId: densityInfo.sampleId,
        crossValidationResult: crossValidation.result,
      }),
    );

    const stateAfterCV: IState = yield select();
    const densityInfoAfterCV = stateAfterCV.data.densityEstimationResult.filter(
      d => d.sampleId === sampleId,
    )[0].cvScores;

    yield setBestAlgorithm(sampleId);
  } else if (crossValidation.err.status === 'error-at-child-process') {
    yield put(
      sendFailedMessageAction({
        id: 'cross-cv-child-process-error',
        msg: `
        ${crossValidation.err.err}; install R and enable path through 'Rscript'.
        [hint] https://github.com/Tan-Furukawa/badzupa
        `,
        status: 'error',
      }),
    );
    yield put(registerNowComputation(false));
  } else {
    if (`${crossValidation.err.err}`.includes('no package')) {
      yield put(
        sendFailedMessageAction({
          id: 'cross-validation-no-package-error',
          msg: `
            error in execution of R: ${crossValidation.err.err}
            [hint] https://github.com/Tan-Furukawa/badzupaR
            `,
          status: 'error',
        }),
      );
    } else {
      yield put(
        sendFailedMessageAction({
          id: 'cross-validation-error',
          msg: `error in execution of R: ${crossValidation.err.err}`,
          status: 'error',
        }),
      );
    }
    yield put(registerNowComputation(false));
  }
}

export function* doBaseDensityEstimation(sampleId: string) {
  const state: IState = yield select();
  const densityInfo = state.data.densityEstimationResult.filter(
    d => d.sampleId === sampleId,
  )[0];
  const usedAlgorithm = densityInfo.bestAlgorithm;

  if (usedAlgorithm !== undefined) {
    const baseDensityEstimation: { err: any; result: ICoordinate[] } =
      yield safe(
        call(window.densityEstimationR.baseDensityEstimation, {
          data: densityInfo.data,
          algorithm: usedAlgorithm,
        }),
      );

    if (!baseDensityEstimation.err) {
      yield put(
        registerBaseDensityEstimationResultAction({
          sampleId: sampleId,
          baseDensityResult: baseDensityEstimation.result,
        }),
      );
    } else {
      yield put(
        sendFailedMessageAction({
          id: 'error-in-base-density-estimation-in-badzupaR',
          msg: 'error in density estimation in badzupaR',
          status: 'error',
        }),
      );
      yield put(registerNowComputation(false));
    }
  } else {
    yield put(
      sendFailedMessageAction({
        id: 'no-cross-validation-result',
        msg: 'no cross validation result',
        status: 'error',
      }),
    );
    yield put(registerNowComputation(false));
  }
}

export function* doBootStrap(sampleId: string) {
  const state: IState = yield select();
  const densityInfo = state.data.densityEstimationResult.filter(
    d => d.sampleId === sampleId,
  )[0];
  const usedAlgorithm = densityInfo.bestAlgorithm;

  const bootstrapSize = {
    ...{ ...state.data.sampleStatusList.find(d => d.sampleId === sampleId) }
      .estimationParam,
  }.bootstrapSize;

  const confidentLevel = {
    ...{ ...state.data.sampleStatusList.find(d => d.sampleId === sampleId) }
      .estimationParam,
  }.densityEstimationConfidentLevel;

  if (usedAlgorithm !== undefined) {
    const bootstrapResult: { err: any; result: IBootstrapResult } = yield safe(
      call(window.densityEstimationR.bootstrap, {
        data: densityInfo.data,
        algorithm: usedAlgorithm,
        bootstrapSize: bootstrapSize === undefined ? 400 : bootstrapSize,
        confidentLevel:
          confidentLevel === undefined
            ? 90
            : !(0 < confidentLevel && confidentLevel < 100)
            ? 90
            : confidentLevel,
      }),
    );
    if (!bootstrapResult.err) {
      yield put(
        registerBootstrapResultAction({
          sampleId: sampleId,
          bootstrapResult: bootstrapResult.result,
        }),
      );
    } else {
      yield put(
        sendFailedMessageAction({
          id: 'error-in-bootstrap-in-badzupaR',
          msg: 'error in density estimation in badzupaR::Bootstrap$new(...)',
          status: 'error',
        }),
      );
      yield put(registerNowComputation(false));
    }
  } else {
    yield put(
      sendFailedMessageAction({
        id: 'no-density-estimation-result',
        msg: 'no density estimation result',
        status: 'error',
      }),
    );
    yield put(registerNowComputation(false));
  }
}
