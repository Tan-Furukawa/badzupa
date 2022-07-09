"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerResultToMdsAction = exports.changeConfidentLevelAtMdsAction = exports.changeBootstrapSizeAtMdsAction = exports.registerDataToMDSAction = exports.setSampleListForMdsAction = exports.getSelectedAgeDataList = exports.saveEstimationParamInput = exports.doAllGetAgeData = exports.clearDensityEstimationResultFromStateAction = exports.deleteAgeDataFromDB = exports.deleteAgeDataFromDBAction = exports.addAgeDataToDB = exports.getAgeDataList = exports.ageDataListOperation = exports.deleteSampleStatusList = exports.addSampleStatusToJSON = exports.getSampleList = exports.sampleListOperation = exports.sendFailedMessageToDataAction = exports.setComputationDoneAction = exports.toggleSampleListDoneAction = exports.toggleSampleListCheckAction = exports.registerAgeData = void 0;
const typescript_fsa_1 = require("typescript-fsa");
require("../core/ICore");
// action creator を作成する
// 引数は、アクションのグループごとに一意
// ファイル単位で、1つの creator があれば良い
const actionCreator = (0, typescript_fsa_1.actionCreatorFactory)('data-action');
// アクションの定義
// 引数は（同じ creator から生成される）アクションごとに一意
exports.registerAgeData = actionCreator('register-age-data');
exports.toggleSampleListCheckAction = actionCreator('toggle-sample-check-action');
exports.toggleSampleListDoneAction = actionCreator('toggle-sample-done');
exports.setComputationDoneAction = actionCreator('computation-done');
exports.sendFailedMessageToDataAction = actionCreator('send-failed-message-to-data');
// get densityボタンが押された時にIData.DensityEstimationResultにデータを移す。
// export const makeDensityEstimationResults =
// ==========================================================================
// ==========================================================================
exports.sampleListOperation = actionCreator.async('sample-list-operation');
// ==========================================================================
// ==========================================================================
const getSampleList = async (dispatch) => {
    // スタート!
    dispatch(exports.sampleListOperation.started(null));
    // 処理中...
    const sampleList = await window.core.loadSampleListFromJSON().catch(e => {
        // 失敗
        console.error(e);
        dispatch(exports.sampleListOperation.failed({
            error: {
                id: 'get-sample-list',
                msg: 'failed to get sample list',
                status: 'error',
            },
            params: null,
        }));
    });
    if (!sampleList)
        return;
    dispatch(exports.sampleListOperation.done({ result: sampleList, params: null })); // --(c)
};
exports.getSampleList = getSampleList;
const addSampleStatusToJSON = async (dispatch, sampleStatus) => {
    dispatch(exports.sampleListOperation.started(null));
    const newSampleList = await window.core
        .saveSampleListToJSON(sampleStatus)
        .catch(e => {
        console.error(e);
        dispatch(exports.sampleListOperation.failed({
            error: {
                id: 'add-to-sample-list',
                msg: 'failed to add sample list',
                status: 'error',
            },
            params: null,
        }));
    });
    if (!newSampleList)
        return sampleStatus;
    dispatch(exports.sampleListOperation.done({ result: newSampleList, params: null }));
    return {
        ...newSampleList.filter(s => s.sampleId === sampleStatus.sampleId)[0],
    };
};
exports.addSampleStatusToJSON = addSampleStatusToJSON;
const deleteSampleStatusList = async (sampleId, dispatch, sampleList) => {
    dispatch(exports.sampleListOperation.started(null));
    await window.core.deleteSampleFromJSON(sampleId).catch(e => {
        console.error(e);
        dispatch(exports.sampleListOperation.failed({
            error: {
                id: 'delete-sample-list',
                msg: 'failed to delete sample list',
                status: 'error',
            },
            params: null,
        }));
    });
    const newSampleList = sampleList.filter(d => d.sampleId !== sampleId);
    dispatch(exports.sampleListOperation.done({ result: newSampleList, params: null }));
};
exports.deleteSampleStatusList = deleteSampleStatusList;
// ==========================================================================
// ==========================================================================
exports.ageDataListOperation = actionCreator.async('age-data-operation');
// ==========================================================================
// ==========================================================================
const getAgeDataList = async (dispatch, sampleId) => {
    dispatch(exports.ageDataListOperation.started(sampleId));
    const ageData = await window.core.loadAgeDataFromDB(sampleId).catch(e => {
        console.error(e);
        dispatch(exports.ageDataListOperation.failed({
            error: {
                id: 'get-age-data',
                msg: 'failed to get age data from list',
                status: 'error',
            },
            params: sampleId,
        }));
    });
    if (!ageData)
        return;
    dispatch(exports.ageDataListOperation.done({ result: ageData, params: sampleId })); // --(c)
};
exports.getAgeDataList = getAgeDataList;
const addAgeDataToDB = async (dispatch, ageData) => {
    dispatch(exports.ageDataListOperation.started(''));
    await window.core.saveAgeDataToDB(ageData).catch(e => {
        console.error(e);
        dispatch(exports.ageDataListOperation.failed({
            error: {
                id: 'add-age-data',
                msg: 'failed to add age data',
                status: 'error',
            },
            params: ageData.sampleId,
        }));
    });
    // if (!newSampleList) return;
    dispatch(exports.ageDataListOperation.done({
        result: ageData.data,
        params: ageData.sampleId,
    }));
};
exports.addAgeDataToDB = addAgeDataToDB;
exports.deleteAgeDataFromDBAction = actionCreator('delete-age-data-from-db');
const deleteAgeDataFromDB = async (sampleId, dispatch) => {
    dispatch((0, exports.deleteAgeDataFromDBAction)({ sampleId: sampleId }));
    await window.core.deleteAgeDataFromDB(sampleId).catch(e => {
        console.error(e);
        dispatch(exports.ageDataListOperation.failed({
            error: {
                id: 'add-age-data',
                msg: 'failed to add age data',
                status: 'error',
            },
            params: sampleId,
        }));
    });
    // dispatch(
    //   ageDataListOperation.done({
    //     result: [],
    //     params: sampleId,
    //   }),
    // );
};
exports.deleteAgeDataFromDB = deleteAgeDataFromDB;
exports.clearDensityEstimationResultFromStateAction = actionCreator('clear-density-estimation-result');
exports.doAllGetAgeData = actionCreator.async('do-age-data-operation');
exports.saveEstimationParamInput = actionCreator('save-estimation-param-input');
// sampleIdsの年代データの登録が終わったかどうかを述べるためだけの関数(上の関数が中で動く)
// 特にreducerもない
// 終了フラグを立てるだけ
const getSelectedAgeDataList = async (dispatch, sampleIds) => {
    return new Promise((resolve, reject) => {
        const promiseList = [];
        sampleIds.forEach(sampleId => {
            promiseList.push((0, exports.getAgeDataList)(dispatch, sampleId));
        });
        exports.doAllGetAgeData.started(null);
        Promise.all(promiseList)
            .then(() => {
            resolve();
            dispatch(exports.doAllGetAgeData.done({ result: null, params: null }));
        })
            .catch((e) => {
            reject(e);
            dispatch(exports.doAllGetAgeData.failed({
                error: {
                    id: 'get-selected-age-data',
                    msg: 'failed to get age data from list',
                    status: 'error',
                },
                params: null,
            }));
        });
    });
};
exports.getSelectedAgeDataList = getSelectedAgeDataList;
exports.setSampleListForMdsAction = actionCreator('set-sample-list-for-mds');
exports.registerDataToMDSAction = actionCreator('register-data-to-mds');
exports.changeBootstrapSizeAtMdsAction = actionCreator('change-bootstrap-size-at-mds');
exports.changeConfidentLevelAtMdsAction = actionCreator('change-confident-level-action');
exports.registerResultToMdsAction = actionCreator('register-result-to-mds');
//# sourceMappingURL=DataActions.js.map