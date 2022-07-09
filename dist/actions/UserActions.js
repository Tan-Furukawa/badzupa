"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNowComputation = exports.clearMdsProgressAction = exports.updateMdsProgressAction = exports.clearCrossValidationProgressBarAction = exports.clearBootstrapProgressBarAction = exports.updateCrossValidationProgressAction = exports.updateBootstrapProgressAction = exports.updateAlgorithmListAction = exports.changeCrossValidationSize = exports.changeBootstrapSizeAction = exports.changeConfidentLevelAction = exports.appendDensityDisplayAction = exports.registerBlankDensityDisplayAction = exports.loadingByAction = exports.updateLoadedDataAction = exports.selectIsotopeDataAction = exports.selectTableOrCsvAction = exports.changeSampleNameAction = exports.changeUserAction = exports.changeViewAction = exports.deleteFailedMessageAction = exports.clearFailedMessageInUserAction = exports.sendFailedMessageAction = void 0;
const typescript_fsa_1 = require("typescript-fsa");
// action creator を作成する
// 引数は、アクションのグループごとに一意
// ファイル単位で、1つの creator があれば良い
const actionCreator = (0, typescript_fsa_1.actionCreatorFactory)('user-action');
// アクションの定義
// 引数は（同じ creator から生成される）アクションごとに一意
exports.sendFailedMessageAction = actionCreator('send-failed-message');
exports.clearFailedMessageInUserAction = actionCreator('clear-failed-message-user-action');
exports.deleteFailedMessageAction = actionCreator('delete-failed-message');
exports.changeViewAction = actionCreator('change-view');
exports.changeUserAction = actionCreator('change-user');
exports.changeSampleNameAction = actionCreator('change-sample-name');
exports.selectTableOrCsvAction = actionCreator('toggle-table-or-csv-action');
exports.selectIsotopeDataAction = actionCreator('select-data-action');
exports.updateLoadedDataAction = actionCreator('update-loaded-data');
// なぜかpartialをつけると(GridElement[]|undefined)[]になる????
exports.loadingByAction = actionCreator('loading-by');
exports.registerBlankDensityDisplayAction = actionCreator('register-blank-density-display');
// Partial<IDensityEstimationResultDisplay>
exports.appendDensityDisplayAction = actionCreator('append-density-display-action');
// export const toggleShowCDFAction = actionCreator<{
//   sampleId: string;
//   showCDF: boolean;
// }>('toggle-show-cdf');
exports.changeConfidentLevelAction = actionCreator('change-confident-level-action');
exports.changeBootstrapSizeAction = actionCreator('change-bootstrap-size');
exports.changeCrossValidationSize = actionCreator('change-cross-validation-size');
exports.updateAlgorithmListAction = actionCreator('toggle-algorithm-list');
exports.updateBootstrapProgressAction = actionCreator('update-bootstrap-progress');
exports.updateCrossValidationProgressAction = actionCreator('update-cross-validation-progress');
exports.clearBootstrapProgressBarAction = actionCreator('clear-bootstrap-progress-bar');
exports.clearCrossValidationProgressBarAction = actionCreator('clear-cross-validation-progress-bar');
exports.updateMdsProgressAction = actionCreator('update-mds-progress-action');
exports.clearMdsProgressAction = actionCreator('clear-mds-progress-action');
exports.registerNowComputation = actionCreator('now-computation');
//# sourceMappingURL=UserActions.js.map