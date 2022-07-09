import { SagaIterator } from 'redux-saga';
import { call, CallEffect, put, select } from 'redux-saga/effects';
import {
  registerDataToMDSAction,
  registerResultToMdsAction,
} from '../actions/DataActions';
import { sendFailedMessageAction } from '../actions/UserActions';
import { IAge, IAgeData, IMdsEstimation } from '../states/IData';
import { IState } from '../states/IState';

export function* safe(
  // effect: CallEffect<any>,
  effect: CallEffect<any>,
): SagaIterator<{ err: any; result: any }> {
  try {
    return { err: null, result: yield effect };
  } catch (err) {
    return { err: err, result: null };
  }
}

export function* setAgeDataToMdsEstimationData(sampleIds: string[]) {
  const dataList = [];

  for (const sampleId of sampleIds) {
    const ageData: { err: any; result: IAge[] } = yield safe(
      call(window.core.loadAgeDataFromDB, sampleId),
    );
    dataList.push({
      sampleId: sampleId,
      data: ageData.result,
    });
  }

  yield put(registerDataToMDSAction({ dataList: dataList }));
}

export function* startMdsEstimation() {
  const state: IState = yield select();

  const mdsEstimationResult: { err: any; result: IMdsEstimation } = yield safe(
    call(window.mdsEstimationR.mds, {
      ...state.data.msdResult,
    }),
  );

  if (mdsEstimationResult.err) {
    yield put(
      sendFailedMessageAction({
        id: 'mds-computation-error',
        msg: 'error in badzupaR::getBootstrapMDS()',
        status: 'error',
      }),
    );
  } else {
    yield put(registerResultToMdsAction(mdsEstimationResult.result));
  }
}
