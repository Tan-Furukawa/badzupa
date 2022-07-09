import { actionCreatorFactory } from 'typescript-fsa';
import {
  IAge,
  IAgeData,
  IEstimationParam,
  IMdsEstimation,
} from '../states/IData';
import { Dispatch } from 'redux';
import '../core/ICore';
import { ISampleStatus } from '../states/IData';
import { IFailedMessage } from '../states/IUser';

// action creator を作成する
// 引数は、アクションのグループごとに一意
// ファイル単位で、1つの creator があれば良い
const actionCreator = actionCreatorFactory('data-action');

// アクションの定義
// 引数は（同じ creator から生成される）アクションごとに一意

export const registerAgeData = actionCreator<IAgeData>('register-age-data');

export const toggleSampleListCheckAction = actionCreator<{
  id: string;
  checked: boolean;
}>('toggle-sample-check-action');

export const toggleSampleListDoneAction =
  actionCreator<string>('toggle-sample-done');

export const setComputationDoneAction =
  actionCreator<string>('computation-done');

export const sendFailedMessageToDataAction = actionCreator<{
  id: string;
  msg: string;
  status: 'error' | 'warning';
}>('send-failed-message-to-data');

// get densityボタンが押された時にIData.DensityEstimationResultにデータを移す。
// export const makeDensityEstimationResults =

// ==========================================================================
// ==========================================================================
export const sampleListOperation = actionCreator.async<
  null,
  ISampleStatus[],
  IFailedMessage
>('sample-list-operation');
// ==========================================================================
// ==========================================================================

export const getSampleList = async (dispatch: Dispatch): Promise<void> => {
  // スタート!
  dispatch(sampleListOperation.started(null));
  // 処理中...
  const sampleList = await window.core.loadSampleListFromJSON().catch(e => {
    // 失敗
    console.error(e);
    dispatch(
      sampleListOperation.failed({
        error: {
          id: 'get-sample-list',
          msg: 'failed to get sample list',
          status: 'error',
        },
        params: null,
      }),
    );
  });
  if (!sampleList) return;
  dispatch(sampleListOperation.done({ result: sampleList, params: null })); // --(c)
};

export const addSampleStatusToJSON = async (
  dispatch: Dispatch,
  sampleStatus: ISampleStatus,
  // ageData: IAgeData,
): Promise<ISampleStatus> => {
  dispatch(sampleListOperation.started(null));
  const newSampleList = await window.core
    .saveSampleListToJSON(sampleStatus)
    .catch(e => {
      console.error(e);
      dispatch(
        sampleListOperation.failed({
          error: {
            id: 'add-to-sample-list',
            msg: 'failed to add sample list',
            status: 'error',
          },
          params: null,
        }),
      );
    });
  if (!newSampleList) return sampleStatus;
  dispatch(sampleListOperation.done({ result: newSampleList, params: null }));
  return {
    ...newSampleList.filter(s => s.sampleId === sampleStatus.sampleId)[0],
  };
};

export const deleteSampleStatusList = async (
  sampleId: string,
  dispatch: Dispatch,
  sampleList: ISampleStatus[],
): Promise<void> => {
  dispatch(sampleListOperation.started(null));
  await window.core.deleteSampleFromJSON(sampleId).catch(e => {
    console.error(e);
    dispatch(
      sampleListOperation.failed({
        error: {
          id: 'delete-sample-list',
          msg: 'failed to delete sample list',
          status: 'error',
        },
        params: null,
      }),
    );
  });
  const newSampleList = sampleList.filter(d => d.sampleId !== sampleId);
  dispatch(sampleListOperation.done({ result: newSampleList, params: null }));
};

// ==========================================================================
// ==========================================================================
export const ageDataListOperation = actionCreator.async<
  string,
  IAge[],
  IFailedMessage
>('age-data-operation');
// ==========================================================================
// ==========================================================================

export const getAgeDataList = async (
  dispatch: Dispatch,
  sampleId: string,
): Promise<void> => {
  dispatch(ageDataListOperation.started(sampleId));
  const ageData = await window.core.loadAgeDataFromDB(sampleId).catch(e => {
    console.error(e);
    dispatch(
      ageDataListOperation.failed({
        error: {
          id: 'get-age-data',
          msg: 'failed to get age data from list',
          status: 'error',
        },
        params: sampleId,
      }),
    );
  });
  if (!ageData) return;
  dispatch(ageDataListOperation.done({ result: ageData, params: sampleId })); // --(c)
};

export const addAgeDataToDB = async (
  dispatch: Dispatch,
  ageData: IAgeData,
): Promise<void> => {
  dispatch(ageDataListOperation.started(''));
  await window.core.saveAgeDataToDB(ageData).catch(e => {
    console.error(e);
    dispatch(
      ageDataListOperation.failed({
        error: {
          id: 'add-age-data',
          msg: 'failed to add age data',
          status: 'error',
        },
        params: ageData.sampleId,
      }),
    );
  });
  // if (!newSampleList) return;
  dispatch(
    ageDataListOperation.done({
      result: ageData.data,
      params: ageData.sampleId,
    }),
  );
};

export const deleteAgeDataFromDBAction = actionCreator<{ sampleId: string }>(
  'delete-age-data-from-db',
);

export const deleteAgeDataFromDB = async (
  sampleId: string,
  dispatch: Dispatch,
): Promise<void> => {
  dispatch(deleteAgeDataFromDBAction({ sampleId: sampleId }));
  await window.core.deleteAgeDataFromDB(sampleId).catch(e => {
    console.error(e);
    dispatch(
      ageDataListOperation.failed({
        error: {
          id: 'add-age-data',
          msg: 'failed to add age data',
          status: 'error',
        },
        params: sampleId,
      }),
    );
  });

  // dispatch(
  //   ageDataListOperation.done({
  //     result: [],
  //     params: sampleId,
  //   }),
  // );
};

export const clearDensityEstimationResultFromStateAction = actionCreator<void>(
  'clear-density-estimation-result',
);

export const doAllGetAgeData = actionCreator.async<null, null, IFailedMessage>(
  'do-age-data-operation',
);

export const saveEstimationParamInput = actionCreator<IEstimationParam>(
  'save-estimation-param-input',
);

// sampleIdsの年代データの登録が終わったかどうかを述べるためだけの関数(上の関数が中で動く)
// 特にreducerもない
// 終了フラグを立てるだけ
export const getSelectedAgeDataList = async (
  dispatch: Dispatch,
  sampleIds: string[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const promiseList: Promise<void>[] = [];

    sampleIds.forEach(sampleId => {
      promiseList.push(getAgeDataList(dispatch, sampleId));
    });

    doAllGetAgeData.started(null);

    Promise.all(promiseList)
      .then(() => {
        resolve();
        dispatch(doAllGetAgeData.done({ result: null, params: null }));
      })
      .catch((e: Error) => {
        reject(e);
        dispatch(
          doAllGetAgeData.failed({
            error: {
              id: 'get-selected-age-data',
              msg: 'failed to get age data from list',
              status: 'error',
            },
            params: null,
          }),
        );
      });
  });
};

export const setSampleListForMdsAction = actionCreator<{ sampleIds: string[] }>(
  'set-sample-list-for-mds',
);

export const registerDataToMDSAction = actionCreator<{ dataList: IAgeData[] }>(
  'register-data-to-mds',
);

export const changeBootstrapSizeAtMdsAction = actionCreator<{
  NBootstrap: number;
}>('change-bootstrap-size-at-mds');

export const changeConfidentLevelAtMdsAction = actionCreator<{ ci: number }>(
  'change-confident-level-action',
);

export const registerResultToMdsAction = actionCreator<IMdsEstimation>(
  'register-result-to-mds',
);
