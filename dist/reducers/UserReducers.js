"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUser = void 0;
const typescript_fsa_reducers_1 = require("typescript-fsa-reducers");
const UserActions_1 = require("../actions/UserActions");
// Stateの初期値
exports.initUser = {
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
const userReducer = (0, typescript_fsa_reducers_1.reducerWithInitialState)(exports.initUser)
    // Action ごとに`.case`をメソッドチェーンでつなぐ
    // 1番目の引数は、アクション、2番めが処理の関数
    // 処理の関数の引数は、1番目が変更前の State、2番めが Action の値
    // 必ず、Stateと同じ型(ここでは、IUser)のオブジェクトを return する必要がある。
    // payload はここでは、Actionで指定した`Partial<IUser>`の型のオブジェクト。
    .case(UserActions_1.changeUserAction, (state, payload) => ({
    ...state,
    ...payload,
}))
    .case(UserActions_1.changeViewAction, (state, payload) => {
    return {
        ...state,
        nowDisplay: payload,
    };
})
    .case(UserActions_1.changeSampleNameAction, (state, payload) => {
    return {
        ...state,
        sampleName: payload,
    };
})
    .case(UserActions_1.updateLoadedDataAction, (state, payload) => {
    return {
        ...state,
        loadedData: payload,
    };
})
    .case(UserActions_1.loadingByAction, (state, payload) => {
    return {
        ...state,
        loadingBy: payload,
    };
})
    .case(UserActions_1.selectIsotopeDataAction, (state, payload) => {
    return {
        ...state,
        nowSelectData: payload,
    };
})
    .case(UserActions_1.selectTableOrCsvAction, (state, payload) => {
    return {
        ...state,
        nowSelectDataLoadingMethod: payload,
    };
})
    .case(UserActions_1.sendFailedMessageAction, (state, payload) => {
    const failedMessage = state.failedMessage.filter(d => d.id !== payload.id);
    failedMessage.push(payload);
    return {
        ...state,
        failedMessage: failedMessage,
    };
})
    .case(UserActions_1.clearFailedMessageInUserAction, (state, payload) => {
    return {
        ...state,
        failedMessage: [],
    };
})
    .case(UserActions_1.deleteFailedMessageAction, (state, payload) => {
    const failedMessage = state.failedMessage.filter(d => d.id !== payload);
    return {
        ...state,
        failedMessage: failedMessage,
    };
})
    .case(UserActions_1.changeConfidentLevelAction, (state, payload) => {
    return {
        ...state,
        estimationParamInput: {
            ...state.estimationParamInput,
            densityEstimationConfidentLevel: payload,
        },
    };
})
    .case(UserActions_1.changeBootstrapSizeAction, (state, payload) => {
    return {
        ...state,
        estimationParamInput: {
            ...state.estimationParamInput,
            bootstrapSize: payload,
        },
    };
})
    .case(UserActions_1.changeCrossValidationSize, (state, payload) => {
    return {
        ...state,
        estimationParamInput: {
            ...state.estimationParamInput,
            crossValidationSize: payload,
        },
    };
})
    .case(UserActions_1.updateAlgorithmListAction, (state, payload) => {
    const algorithmInfo = state.estimationParamInput.usedAlgorithmList.filter(d => d.algorithm === payload.algorithm)[0];
    if (algorithmInfo === undefined)
        return state;
    return {
        ...state,
        estimationParamInput: {
            ...state.estimationParamInput,
            usedAlgorithmList: state.estimationParamInput.usedAlgorithmList.map(d => {
                if (d.algorithm === payload.algorithm) {
                    return { ...d, used: !algorithmInfo.used };
                }
                else {
                    return d;
                }
            }),
        },
    };
})
    // eslint-disable-next-line complexity
    .case(UserActions_1.appendDensityDisplayAction, (state, payload) => {
    if (payload.sampleId === undefined) {
        return state;
    }
    else {
        const targetDisplay = state.densityEstimationResultDisplay.filter(d => d.sampleId === payload.sampleId);
        if (targetDisplay.length === 0) {
            return {
                ...state,
                densityEstimationResultDisplay: state.densityEstimationResultDisplay.concat([
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
        }
        else {
            return {
                ...state,
                densityEstimationResultDisplay: 
                // eslint-disable-next-line complexity
                state.densityEstimationResultDisplay.map(d => d.sampleId !== payload.sampleId
                    ? {
                        ...d,
                        displayColorPicker: false,
                    }
                    : {
                        sampleId: payload.sampleId,
                        showCDF: payload.showCDF === undefined
                            ? targetDisplay[0].showCDF
                            : payload.showCDF,
                        showHistogram: payload.showHistogram === undefined
                            ? targetDisplay[0].showHistogram
                            : payload.showHistogram,
                        xmin: payload.xmin === undefined
                            ? targetDisplay[0].xmin
                            : isNaN(payload.xmin)
                                ? undefined
                                : payload.xmin,
                        xmax: payload.xmax === undefined
                            ? targetDisplay[0].xmax
                            : isNaN(payload.xmax)
                                ? undefined
                                : payload.xmax,
                        bgColor: payload.bgColor === undefined
                            ? targetDisplay[0].bgColor
                            : payload.bgColor,
                        strokeColor: payload.strokeColor === undefined
                            ? targetDisplay[0].strokeColor
                            : payload.strokeColor,
                        displayStrokeColorPicker: payload.displayStrokeColorPicker === undefined
                            ? targetDisplay[0].displayStrokeColorPicker
                            : payload.displayStrokeColorPicker,
                        displayBgColorPicker: payload.displayBgColorPicker === undefined
                            ? targetDisplay[0].displayBgColorPicker
                            : payload.displayBgColorPicker,
                    }),
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
    .case(UserActions_1.updateBootstrapProgressAction, (state, payload) => {
    return {
        ...state,
        bootstrapProgress: payload,
    };
})
    .case(UserActions_1.updateCrossValidationProgressAction, (state, payload) => {
    return {
        ...state,
        crossValidationProgress: payload,
    };
})
    .case(UserActions_1.updateMdsProgressAction, (state, payload) => {
    return {
        ...state,
        mdsProgress: payload,
    };
})
    .case(UserActions_1.clearBootstrapProgressBarAction, (state, payload) => {
    return {
        ...state,
        bootstrapProgress: { index: 0, all: 1 },
    };
})
    .case(UserActions_1.clearCrossValidationProgressBarAction, (state, payload) => {
    return {
        ...state,
        crossValidationProgress: { index: 0, all: 1 },
    };
})
    .case(UserActions_1.clearMdsProgressAction, (state, payload) => {
    return {
        ...state,
        mdsProgress: { index: 0, all: 1 },
    };
})
    .case(UserActions_1.registerNowComputation, (state, payload) => {
    return {
        ...state,
        nowComputation: payload,
    };
})
    .build();
exports.default = userReducer;
//# sourceMappingURL=UserReducers.js.map