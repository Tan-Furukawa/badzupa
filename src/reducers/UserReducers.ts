import { reducerWithInitialState } from 'typescript-fsa-reducers';
import {
  changeUserAction,
  changeViewAction,
  selectIsotopeDataAction,
  selectTableOrCsvAction,
  updateLoadedDataAction,
  sendFailedMessageAction,
  deleteFailedMessageAction,
  loadingByAction,
  changeSampleNameAction,
  appendDensityDisplayAction,
  changeConfidentLevelAction,
  changeBootstrapSizeAction,
  updateAlgorithmListAction,
  changeCrossValidationSize,
  updateBootstrapProgressAction,
  updateCrossValidationProgressAction,
  clearBootstrapProgressBarAction,
  clearCrossValidationProgressBarAction,
  registerNowComputation,
  updateMdsProgressAction,
  clearMdsProgressAction,
  clearFailedMessageInUserAction,
} from '../actions/UserActions';
import IUser, { IDensityEstimationResultDisplay } from '../states/IUser';

// Stateの初期値
export const initUser: IUser = {
  count: 0,
  name: '',
  nowDisplay: 'register',
  nowSelectIsotopeData: 'UPbAge',
  nowSelectDataLoadingMethod: 'dataGrid',
  loadedData: new Array(302)
    .fill([
      { readOnly: true, value: '' },
      { readOnly: false, value: '' },
      { readOnly: false, value: '' },
    ])
    .map((d, i) => {
      if (i === 0) {
        return [
          { value: '', readOnly: true },
          { value: 'age', readOnly: true },
          { value: '2sd', readOnly: true },
        ];
      }
      return [{ readOnly: true, value: i }, d[1], d[2]];
    }),
  loadingBy: 'grid',
  sampleName: '',
  loading: false,
  failedMessage: [],
  densityEstimationResultDisplay: [],
  estimationParamInput: {
    bootstrapSize: 400,
    usedAlgorithmList: [
      { algorithm: 'adeba', used: true },
      { algorithm: 'botev', used: true },
      { algorithm: 'sj', used: false },
    ],
    densityEstimationConfidentLevel: 90,
    crossValidationSize: 10,
  },
  bootstrapProgress: { index: 0, all: 1 },
  crossValidationProgress: { index: 0, all: 1 },
  mdsProgress: { index: 0, all: 1 },
  nowComputation: false,
  // initialSetupDone: false,
};

const userReducer = reducerWithInitialState<IUser>(initUser)
  // Action ごとに`.case`をメソッドチェーンでつなぐ
  // 1番目の引数は、アクション、2番めが処理の関数
  // 処理の関数の引数は、1番目が変更前の State、2番めが Action の値
  // 必ず、Stateと同じ型(ここでは、IUser)のオブジェクトを return する必要がある。
  // payload はここでは、Actionで指定した`Partial<IUser>`の型のオブジェクト。
  .case(changeUserAction, (state, payload) => ({
    ...state,
    ...payload,
  }))
  .case(changeViewAction, (state, payload) => {
    return {
      ...state,
      nowDisplay: payload,
    };
  })
  .case(changeSampleNameAction, (state, payload) => {
    return {
      ...state,
      sampleName: payload,
    };
  })
  .case(updateLoadedDataAction, (state, payload) => {
    return {
      ...state,
      loadedData: payload,
    };
  })
  .case(loadingByAction, (state, payload) => {
    return {
      ...state,
      loadingBy: payload,
    };
  })
  .case(selectIsotopeDataAction, (state, payload) => {
    return {
      ...state,
      nowSelectData: payload,
    };
  })
  .case(selectTableOrCsvAction, (state, payload) => {
    return {
      ...state,
      nowSelectDataLoadingMethod: payload,
    };
  })
  .case(sendFailedMessageAction, (state, payload) => {
    const failedMessage = state.failedMessage.filter(d => d.id !== payload.id);
    failedMessage.push(payload);
    return {
      ...state,
      failedMessage: failedMessage,
    };
  })
  .case(clearFailedMessageInUserAction, (state, payload) => {
    return {
      ...state,
      failedMessage: [],
    };
  })
  .case(deleteFailedMessageAction, (state, payload) => {
    const failedMessage = state.failedMessage.filter(d => d.id !== payload);
    return {
      ...state,
      failedMessage: failedMessage,
    };
  })
  .case(changeConfidentLevelAction, (state, payload) => {
    return {
      ...state,
      estimationParamInput: {
        ...state.estimationParamInput,
        densityEstimationConfidentLevel: payload,
      },
    };
  })
  .case(changeBootstrapSizeAction, (state, payload) => {
    return {
      ...state,
      estimationParamInput: {
        ...state.estimationParamInput,
        bootstrapSize: payload,
      },
    };
  })
  .case(changeCrossValidationSize, (state, payload) => {
    return {
      ...state,
      estimationParamInput: {
        ...state.estimationParamInput,
        crossValidationSize: payload,
      },
    };
  })
  .case(updateAlgorithmListAction, (state, payload) => {
    const algorithmInfo = state.estimationParamInput.usedAlgorithmList.filter(
      d => d.algorithm === payload.algorithm,
    )[0];
    if (algorithmInfo === undefined) return state;
    return {
      ...state,
      estimationParamInput: {
        ...state.estimationParamInput,
        usedAlgorithmList: state.estimationParamInput.usedAlgorithmList.map(
          d => {
            if (d.algorithm === payload.algorithm) {
              return { ...d, used: !algorithmInfo.used };
            } else {
              return d;
            }
          },
        ),
      },
    };
  })
  // eslint-disable-next-line complexity
  .case(appendDensityDisplayAction, (state, payload) => {
    if (payload.sampleId === undefined) {
      return state;
    } else {
      const targetDisplay: IDensityEstimationResultDisplay[] =
        state.densityEstimationResultDisplay.filter(
          d => d.sampleId === payload.sampleId,
        );
      if (targetDisplay.length === 0) {
        return {
          ...state,
          densityEstimationResultDisplay:
            state.densityEstimationResultDisplay.concat([
              {
                sampleId: payload.sampleId,
                showCDF: payload.showCDF,
                showHistogram: payload.showHistogram,
                xmin: payload.xmin,
                xmax: payload.xmax,
                bgColor: payload.bgColor,
                strokeColor: payload.strokeColor,
                displayStrokeColorPicker: payload.displayStrokeColorPicker,
                displayBgColorPicker: payload.displayBgColorPicker,
              },
            ]),
        };
      } else {
        return {
          ...state,
          densityEstimationResultDisplay:
            // eslint-disable-next-line complexity
            state.densityEstimationResultDisplay.map(d =>
              d.sampleId !== payload.sampleId
                ? {
                    ...d,
                    displayColorPicker: false,
                  }
                : {
                    sampleId: payload.sampleId,
                    showCDF:
                      payload.showCDF === undefined
                        ? targetDisplay[0].showCDF
                        : payload.showCDF,
                    showHistogram:
                      payload.showHistogram === undefined
                        ? targetDisplay[0].showHistogram
                        : payload.showHistogram,
                    xmin:
                      payload.xmin === undefined
                        ? targetDisplay[0].xmin
                        : isNaN(payload.xmin)
                        ? undefined
                        : payload.xmin,
                    xmax:
                      payload.xmax === undefined
                        ? targetDisplay[0].xmax
                        : isNaN(payload.xmax)
                        ? undefined
                        : payload.xmax,
                    bgColor:
                      payload.bgColor === undefined
                        ? targetDisplay[0].bgColor
                        : payload.bgColor,
                    strokeColor:
                      payload.strokeColor === undefined
                        ? targetDisplay[0].strokeColor
                        : payload.strokeColor,
                    displayStrokeColorPicker:
                      payload.displayStrokeColorPicker === undefined
                        ? targetDisplay[0].displayStrokeColorPicker
                        : payload.displayStrokeColorPicker,
                    displayBgColorPicker:
                      payload.displayBgColorPicker === undefined
                        ? targetDisplay[0].displayBgColorPicker
                        : payload.displayBgColorPicker,
                  },
            ),
        };
      }
    }
  })
  // .case(toggleShowCDFAction, (state, payload) => {
  //   return {
  //     ...state,
  //     densityEstimationResultDisplay: state.densityEstimationResultDisplay.map(
  //       d => {
  //         if (d.sampleId === payload.sampleId) {
  //           return {
  //             ...d,
  //             showCDF: payload.showCDF === undefined ? true : !payload.showCDF,
  //           };
  //         } else {
  //           return d;
  //         }
  //       },
  //     ),
  //   };
  // })
  .case(updateBootstrapProgressAction, (state, payload) => {
    return {
      ...state,
      bootstrapProgress: payload,
    };
  })
  .case(updateCrossValidationProgressAction, (state, payload) => {
    return {
      ...state,
      crossValidationProgress: payload,
    };
  })
  .case(updateMdsProgressAction, (state, payload) => {
    return {
      ...state,
      mdsProgress: payload,
    };
  })
  .case(clearBootstrapProgressBarAction, (state, payload) => {
    return {
      ...state,
      bootstrapProgress: { index: 0, all: 1 },
    };
  })
  .case(clearCrossValidationProgressBarAction, (state, payload) => {
    return {
      ...state,
      crossValidationProgress: { index: 0, all: 1 },
    };
  })
  .case(clearMdsProgressAction, (state, payload) => {
    return {
      ...state,
      mdsProgress: { index: 0, all: 1 },
    };
  })
  .case(registerNowComputation, (state, payload) => {
    return {
      ...state,
      nowComputation: payload,
    };
  })
  .build();

export default userReducer;
