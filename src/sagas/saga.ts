import { select, put, take, fork } from 'redux-saga/effects';
import {
  setComputationDoneAction,
  toggleSampleListDoneAction,
} from '../actions/DataActions';
import {
  changeViewAction,
  registerNowComputation,
} from '../actions/UserActions';
import { IAge } from '../states/IData';
import { IState } from '../states/IState';
import { IGetDbStatus } from '../states/IUser';
import {
  doCreateTables,
  doDeleteBaseDensity,
  doDeleteBootstrapPeaks,
  doDeleteCrossValidationResult,
  doDeleteDensityCi,
  doDeletePeaksCertainty,
  doSaveBaseDensity,
  doSaveBootstrapPeaks,
  doSaveCrossValidationResult,
  doSaveDensityCi,
  doSavePeaksCertainty,
  doSelectBaseDensity,
  doSelectBootstrapResult,
  doSelectCrossValidationResult,
} from './dbOperation';
import {
  doBaseDensityEstimation,
  doBootStrap,
  doCrossValidation,
} from './densityEstimation';
import {
  setAgeDataToMdsEstimationData,
  startMdsEstimation,
} from './mdsEstimation';

function* deleteRelevantData(sampleId: string) {
  yield doDeleteCrossValidationResult(sampleId);
  yield doDeleteBaseDensity(sampleId);
  yield doDeleteBootstrapPeaks(sampleId);
  yield doDeleteDensityCi(sampleId);
  yield doDeletePeaksCertainty(sampleId);
}

// eslint-disable-next-line complexity
function* handleDensityEstimation() {
  while (true) {
    const action: { result: IAge[]; params: string } = yield take(
      'data-action/do-age-data-operation_DONE',
    );

    let state: IState = yield select();
    const densityInfos = state.data.densityEstimationResult;

    for (let i = 0; i < densityInfos.length; i++) {
      yield put(registerNowComputation(true));

      const densityInfo = densityInfos[i];
      const sampleId = densityInfo.sampleId;

      yield doCreateTables();
      // for debug
      // yield deleteRelevantData(sampleId);
      const selectionCrossValidationRes: IGetDbStatus =
        yield doSelectCrossValidationResult(sampleId);
      console.log(`cross validation data:${selectionCrossValidationRes}`);
      switch (selectionCrossValidationRes) {
        case 'failed':
          yield doDeleteCrossValidationResult(sampleId);
          yield doCrossValidation(sampleId);
          yield doSaveCrossValidationResult(sampleId);
        case 'notExists':
          yield doCrossValidation(sampleId);
          yield doSaveCrossValidationResult(sampleId);
      }

      state = yield select();
      if (!state.user.nowComputation) continue;

      const selectionDensityRes: IGetDbStatus = yield doSelectBaseDensity(
        sampleId,
      );
      console.log(`base density data:${selectionDensityRes}`);
      switch (selectionDensityRes) {
        case 'failed':
          yield doDeleteBaseDensity(sampleId);
          yield doBaseDensityEstimation(sampleId);
          yield doSaveBaseDensity(sampleId);
        case 'notExists':
          yield doBaseDensityEstimation(sampleId);
          yield doSaveBaseDensity(sampleId);
      }

      state = yield select();
      if (!state.user.nowComputation) continue;

      const selectionBootstrapRes: IGetDbStatus = yield doSelectBootstrapResult(
        sampleId,
      );
      console.log(`bootstrap data:${selectionBootstrapRes}`);

      if (
        selectionBootstrapRes === 'failed' ||
        selectionBootstrapRes === 'notExists'
      ) {
        yield doDeleteBootstrapPeaks(sampleId);
        yield doDeleteDensityCi(sampleId);
        yield doDeletePeaksCertainty(sampleId);
        yield doBootStrap(sampleId);
        yield doSaveBootstrapPeaks(sampleId);
        yield doSaveDensityCi(sampleId);
        yield doSavePeaksCertainty(sampleId);
      }

      state = yield select();
      if (!state.user.nowComputation) continue;

      yield put(setComputationDoneAction(sampleId));
      yield put(toggleSampleListDoneAction(sampleId));
      window.core.toggleDoneSampleListFromJSON(sampleId);

      const check: IState = yield select();
      console.log(check);
    }
    yield put(registerNowComputation(false));
    yield put(changeViewAction('result'));
  }
}

function* handleMdsEstimation() {
  while (true) {
    const action: { payload: { sampleIds: string[] }; params: string } =
      yield take('data-action/set-sample-list-for-mds');

    const sampleIds = action.payload.sampleIds;

    yield put(registerNowComputation(true));
    yield setAgeDataToMdsEstimationData(sampleIds);
    yield startMdsEstimation();
    yield put(registerNowComputation(false));
    yield put(changeViewAction('mds'));
  }
}

function* rootSaga() {
  yield fork(handleDensityEstimation);
  yield fork(handleMdsEstimation);
}

export default rootSaga;
