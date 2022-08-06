import { SagaIterator } from 'redux-saga';
import { call, CallEffect, put, select } from 'redux-saga/effects';
import {
  registerBaseDensityEstimationResultAction,
  registerBestAlgorithmAction,
  registerBootstrapResultAction,
  registerCrossValidationAction,
} from '../actions/sagaAction';
import { sendFailedMessageAction } from '../actions/UserActions';
import {
  IBootstrapPeaksCoordinate,
  ICi,
  ICoordinate,
  ICrossValidationResult,
  IDensityEstimation,
  IPeaksCertainty,
} from '../states/IData';
import { IState } from '../states/IState';
import { IGetDbStatus } from '../states/IUser';
import { setBestAlgorithm } from './densityEstimation';

export function* safe(
  effect: CallEffect<unknown>,
  // effect: any,
): SagaIterator<{ err: any; result: unknown }> {
  try {
    return { err: null, result: yield effect };
  } catch (err) {
    return { err: err, result: null };
  }
}

function* selectDensityEstimationResultFitSampleId(
  sampleId: string,
): SagaIterator<IDensityEstimation> {
  const state: IState = yield select();
  const densityInfo = state.data.densityEstimationResult.filter(
    d => d.sampleId === sampleId,
  )[0];
  return densityInfo;
}

export function* doCreateTables() {
  const res: { err: any; result: void | null } = yield safe(
    call(window.densityEstimationR.createTables),
  );
  if (!res.err) {
    // error
    console.error(res.err);
  }
}

export function* doSaveBaseDensity(sampleId: string) {
  const densityInfo: IDensityEstimation =
    yield selectDensityEstimationResultFitSampleId(sampleId);

  if (densityInfo.density !== undefined) {
    const res: { err: any; result: void | null } = yield safe(
      call(
        window.densityEstimationR.saveBaseDensity,
        densityInfo.density,
        sampleId,
      ),
    );
    if (!res.err) {
      // error
      console.error(res.err);
    }
  }
}

export function* doDeleteBaseDensity(sampleId: string) {
  const res: { err: any; result: void | null } = yield safe(
    call(window.densityEstimationR.deleteBaseDensity, sampleId),
  );
  if (!res.err) {
    // error
    console.error(res.err);
  }
}

export function* doSelectBaseDensity(
  sampleId: string,
): Generator<unknown, IGetDbStatus, any> {
  const res: { err: any; result: ICoordinate[] } = yield safe(
    call(window.densityEstimationR.selectBaseDensity, sampleId),
  );
  if (res.err) {
    yield put(
      sendFailedMessageAction({
        id: 'error-in-base-density-data-selection',
        msg: 'error to get base density from database',
        status: 'error',
      }),
    );
    return 'failed';
  } else {
    if (res.result.length === 0) {
      return 'notExists';
    } else {
      yield put(
        registerBaseDensityEstimationResultAction({
          sampleId: sampleId,
          baseDensityResult: res.result,
        }),
      );
      return 'exists';
    }
  }
}

export function* doSaveCrossValidationResult(sampleId: string) {
  const densityInfo: IDensityEstimation =
    yield selectDensityEstimationResultFitSampleId(sampleId);

  if (densityInfo.cvScores !== undefined) {
    const res: { err: any; result: void | null } = yield safe(
      call(
        window.densityEstimationR.saveCrossValidationResult,
        densityInfo.cvScores,
        sampleId,
      ),
    );
    if (!res.err) {
      // error
      console.error(res.err);
    }
  }
}

export function* doDeleteCrossValidationResult(sampleId: string) {
  const res: { err: any; result: void | null } = yield safe(
    call(window.densityEstimationR.deleteCrossValidationResult, sampleId),
  );
  if (!res.err) {
    // error
    console.error(res.err);
  }
}

export function* doSelectCrossValidationResult(
  sampleId: string,
): Generator<unknown, IGetDbStatus, any> {
  const res: { err: any; result: ICrossValidationResult[] } = yield safe(
    call(window.densityEstimationR.selectCrossValidationResult, sampleId),
  );

  if (res.err) {
    yield put(
      sendFailedMessageAction({
        id: 'error-in-cross-validation-result-data-selection',
        msg: 'error to get cross validation result from database',
        status: 'error',
      }),
    );
    return 'failed';
  } else {
    if (res.result.length === 0) {
      return 'notExists';
    } else {
      yield put(
        registerCrossValidationAction({
          sampleId: sampleId,
          crossValidationResult: res.result,
        }),
      );
      yield setBestAlgorithm(sampleId);
      return 'exists';
    }
  }
}

export function* doDeleteBootstrapPeaks(sampleId: string) {
  const res: { err: any; result: void | null } = yield safe(
    call(window.densityEstimationR.deleteBootstrapPeaks, sampleId),
  );
  if (!res.err) {
    // error
    console.error(res.err);
  }
}

export function* doSaveBootstrapPeaks(sampleId: string) {
  const densityInfo: IDensityEstimation =
    yield selectDensityEstimationResultFitSampleId(sampleId);

  if (densityInfo.bootstrapResult !== undefined) {
    if (densityInfo.bootstrapResult.bootstrapPeaks !== undefined) {
      const res: { err: any; result: void | null } = yield safe(
        call(
          window.densityEstimationR.saveBootstrapPeaks,
          densityInfo.bootstrapResult.bootstrapPeaks,
          sampleId,
        ),
      );
      if (!res.err) {
        // console.error(res.err);
        // error
        console.error(res.err);
      }
    }
  }
}

export function* doDeleteDensityCi(sampleId: string) {
  const res: { err: any; result: void | null } = yield safe(
    call(window.densityEstimationR.deleteDensityCi, sampleId),
  );
  if (!res.err) {
    // error
    console.error(res.err);
  }
}

export function* doSaveDensityCi(sampleId: string) {
  const densityInfo: IDensityEstimation =
    yield selectDensityEstimationResultFitSampleId(sampleId);

  if (densityInfo.bootstrapResult !== undefined) {
    if (densityInfo.bootstrapResult.ci !== undefined) {
      const res: { err: any; result: void | null } = yield safe(
        call(
          window.densityEstimationR.saveDensityCi,
          densityInfo.bootstrapResult.ci,
          sampleId,
        ),
      );
      if (!res.err) {
        // error
        console.error(res.err);
      }
    }
  }
}

export function* doSavePeaksCertainty(sampleId: string) {
  const densityInfo: IDensityEstimation =
    yield selectDensityEstimationResultFitSampleId(sampleId);

  if (densityInfo.bootstrapResult !== undefined) {
    if (densityInfo.bootstrapResult.peaksCertainty !== undefined) {
      const res: { err: any; result: void | null } = yield safe(
        call(
          window.densityEstimationR.savePeaksCertainty,
          densityInfo.bootstrapResult.peaksCertainty,
          sampleId,
        ),
      );
      if (!res.err) {
        // error
        console.error(res.err);
      }
    }
  }
}

export function* doDeletePeaksCertainty(sampleId: string) {
  const res: { err: any; result: void | null } = yield safe(
    call(window.densityEstimationR.deletePeaksCertainty, sampleId),
  );
  if (!res.err) {
    // error
    console.error(res.err);
  }
}

export function* doSelectBootstrapResult(
  sampleId: string,
): Generator<unknown, IGetDbStatus, any> {
  const resBootstrapPeaks: { err: any; result: IBootstrapPeaksCoordinate[] } =
    yield safe(call(window.densityEstimationR.selectBootstrapPeaks, sampleId));
  const resDensityCi: { err: any; result: ICi[] } = yield safe(
    call(window.densityEstimationR.selectDensityCi, sampleId),
  );
  const resPeaksCertainty: { err: any; result: IPeaksCertainty[] } = yield safe(
    call(window.densityEstimationR.selectPeaksCertainty, sampleId),
  );
  console.log(resPeaksCertainty);

  if (resBootstrapPeaks.err || resDensityCi.err || resPeaksCertainty.err) {
    yield put(
      sendFailedMessageAction({
        id: 'error-in-bootstrap-result-selection',
        msg: 'error to get base density from database',
        status: 'error',
      }),
    );
    return 'failed';
  } else {
    if (
      resBootstrapPeaks.result.length !== 0 ||
      resDensityCi.result.length !== 0 ||
      resPeaksCertainty.result.length !== 0
    ) {
      yield put(
        registerBootstrapResultAction({
          sampleId: sampleId,
          bootstrapResult: {
            ci: resDensityCi.result,
            bootstrapPeaks: resBootstrapPeaks.result,
            peaksCertainty: resPeaksCertainty.result,
          },
        }),
      );
      return 'exists';
    } else {
      return 'notExists';
    }
  }
}
