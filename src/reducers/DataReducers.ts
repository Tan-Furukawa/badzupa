import { reducerWithInitialState } from 'typescript-fsa-reducers';
import {
  ageDataListOperation,
  changeBootstrapSizeAtMdsAction,
  clearDensityEstimationResultFromStateAction,
  deleteAgeDataFromDBAction,
  registerDataToMDSAction,
  registerResultToMdsAction,
  sampleListOperation,
  saveEstimationParamInput,
  sendFailedMessageToDataAction,
  setComputationDoneAction,
  toggleSampleListCheckAction,
  toggleSampleListDoneAction,
} from '../actions/DataActions';
import {
  registerBaseDensityEstimationResultAction,
  registerBestAlgorithmAction,
  registerBootstrapResultAction,
  registerCrossValidationAction,
} from '../actions/sagaAction';
import IData, { IDensityEstimation } from '../states/IData';

// Stateの初期値
const initData: IData = {
  sampleStatusList: [],
  loading: false,
  failedMessage: [],
  densityEstimationResult: [],
  msdResult: {
    dataList: [],
    ci: 90,
    NBootstrap: 200,
  },
};

const blankDensityEstimation: IDensityEstimation = {
  sampleId: '',
  data: [],
  isFinished: false,
};

const dataReducer = reducerWithInitialState<IData>(initData)
  // Action ごとに`.case`をメソッドチェーンでつなぐ
  // 1番目の引数は、アクション、2番めが処理の関数
  // 処理の関数の引数は、1番目が変更前の State、2番めが Action の値
  // 必ず、Stateと同じ型(ここでは、IUser)のオブジェクトを return する必要がある。
  // payload はここでは、Actionで指定した`Partial<IUser>`の型のオブジェクト。
  .case(sampleListOperation.started, (state, payload) => {
    return {
      ...state,
      loading: true,
    };
  })
  .case(sampleListOperation.done, (state, payload) => {
    return {
      ...state,
      sampleStatusList: payload.result,
    };
  })
  .case(sampleListOperation.failed, (state, payload) => {
    state.failedMessage.push(payload.error);
    state.loading = false;
    return state;
  })
  .case(toggleSampleListCheckAction, (state, payload) => {
    const newSampleList = state.sampleStatusList.map(d => ({
      ...d,
      selected:
        d.sampleId === payload.id
          ? payload.checked
            ? true
            : false
          : d.selected,
    }));
    return {
      ...state,
      sampleStatusList: newSampleList,
    };
  })
  .case(toggleSampleListDoneAction, (state, payload) => {
    return {
      ...state,
      sampleStatusList: state.sampleStatusList.map(l => {
        if (l.sampleId !== payload) {
          return l;
        } else {
          return {
            ...l,
            done: 1,
          };
        }
      }),
    };
  })
  .case(ageDataListOperation.started, (state, payload) => {
    console.log(state.sampleStatusList);
    return state;
  })
  .case(ageDataListOperation.done, (state, payload) => {
    const alreadyExists =
      state.densityEstimationResult.filter(d => d.sampleId === payload.params)
        .length !== 0;
    if (!alreadyExists) {
      return {
        ...state,
        densityEstimationResult: state.densityEstimationResult.concat([
          {
            ...blankDensityEstimation,
            sampleId: payload.params,
            data: payload.result,
          },
        ]),
      };
    } else {
      return {
        ...state,
        densityEstimationResult: state.densityEstimationResult.map(d => {
          if (d.sampleId === payload.params) {
            return { ...d, data: payload.result };
          } else {
            return d;
          }
        }),
      };
    }
  })
  .case(ageDataListOperation.failed, (state, payload) => {
    state.failedMessage.push(payload.error);
    return state;
  })
  .case(deleteAgeDataFromDBAction, (state, payload) => {
    const densityEstimationResult = state.densityEstimationResult.filter(
      d => d.sampleId !== payload.sampleId,
    );
    const sampleStatusList = state.sampleStatusList.filter(
      d => d.sampleId !== payload.sampleId,
    );
    return {
      ...state,
      densityEstimationResult: densityEstimationResult,
      sampleStatusList: sampleStatusList,
    };
  })
  .case(clearDensityEstimationResultFromStateAction, (state, payload) => {
    return {
      ...state,
      densityEstimationResult: [],
    };
  })
  .case(registerCrossValidationAction, (state, payload) => {
    return {
      ...state,
      densityEstimationResult: state.densityEstimationResult.map(d => {
        if (d.sampleId == payload.sampleId) {
          return {
            ...d,
            cvScores: payload.crossValidationResult,
          };
        } else {
          return d;
        }
      }),
    };
  })
  .case(registerBestAlgorithmAction, (state, payload) => {
    return {
      ...state,
      densityEstimationResult: state.densityEstimationResult.map(d => {
        if (d.sampleId == payload.sampleId) {
          return {
            ...d,
            bestAlgorithm: payload.algorithm,
          };
        } else {
          return d;
        }
      }),
    };
  })
  .case(sendFailedMessageToDataAction, (state, payload) => {
    state.failedMessage.push(payload);
    return state;
  })
  .case(registerBaseDensityEstimationResultAction, (state, payload) => {
    return {
      ...state,
      densityEstimationResult: state.densityEstimationResult.map(d => {
        if (d.sampleId == payload.sampleId) {
          return {
            ...d,
            density: payload.baseDensityResult,
          };
        } else {
          return d;
        }
      }),
    };
  })
  .case(saveEstimationParamInput, (state, payload) => {
    return {
      ...state,
      sampleStatusList: state.sampleStatusList.map(s => {
        return {
          ...s,
          estimationParam: payload,
        };
      }),
    };
  })
  .case(registerBootstrapResultAction, (state, payload) => {
    return {
      ...state,
      densityEstimationResult: state.densityEstimationResult.map(d => {
        if (d.sampleId == payload.sampleId) {
          return {
            ...d,
            bootstrapResult: payload.bootstrapResult,
          };
        } else {
          return d;
        }
      }),
    };
  })
  // 上は、下記と同じ意味
  // const user = Object.assign({}, state, payload);
  // return user;
  .case(setComputationDoneAction, (state, payload) => {
    return {
      ...state,
      densityEstimationResult: state.densityEstimationResult.map(d => {
        if (d.sampleId === payload) {
          return { ...d, isFinished: true };
        } else {
          return d;
        }
      }),
    };
  })
  .case(registerDataToMDSAction, (state, payload) => {
    return {
      ...state,
      msdResult: {
        ...state.msdResult,
        dataList: payload.dataList,
      },
    };
  })
  .case(registerResultToMdsAction, (state, payload) => {
    return {
      ...state,
      msdResult: payload,
    };
  })
  .case(changeBootstrapSizeAtMdsAction, (state, payload) => {
    return {
      ...state,
      msdResult: {
        ...state.msdResult,
        NBootstrap: payload.NBootstrap,
      },
    };
  })
  .build();

export default dataReducer;
