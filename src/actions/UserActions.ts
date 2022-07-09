import { actionCreatorFactory } from 'typescript-fsa';
import IUser, {
  IAlgorithmInfo,
  IDensityEstimationResultDisplay,
  IProgress,
} from '../states/IUser';
import { GridElement } from '../components/RegisterView';

// action creator を作成する
// 引数は、アクションのグループごとに一意
// ファイル単位で、1つの creator があれば良い
const actionCreator = actionCreatorFactory('user-action');

// アクションの定義
// 引数は（同じ creator から生成される）アクションごとに一意

export const sendFailedMessageAction = actionCreator<{
  id: string;
  msg: string;
  status: 'error' | 'warning';
}>('send-failed-message');

export const clearFailedMessageInUserAction = actionCreator(
  'clear-failed-message-user-action',
);

export const deleteFailedMessageAction = actionCreator<string>(
  'delete-failed-message',
);

export const changeViewAction = actionCreator<Partial<string>>('change-view');

export const changeUserAction = actionCreator<Partial<IUser>>('change-user');

export const changeSampleNameAction =
  actionCreator<Partial<string>>('change-sample-name');

export const selectTableOrCsvAction = actionCreator<Partial<string>>(
  'toggle-table-or-csv-action',
);

export const selectIsotopeDataAction =
  actionCreator<Partial<string>>('select-data-action');

export const updateLoadedDataAction =
  actionCreator<GridElement[][]>('update-loaded-data');
// なぜかpartialをつけると(GridElement[]|undefined)[]になる????

export const loadingByAction = actionCreator<'grid' | 'csv'>('loading-by');

export const registerBlankDensityDisplayAction = actionCreator<string[]>(
  'register-blank-density-display',
);

// Partial<IDensityEstimationResultDisplay>
export const appendDensityDisplayAction =
  actionCreator<IDensityEstimationResultDisplay>(
    'append-density-display-action',
  );

// export const toggleShowCDFAction = actionCreator<{
//   sampleId: string;
//   showCDF: boolean;
// }>('toggle-show-cdf');

export const changeConfidentLevelAction = actionCreator<number>(
  'change-confident-level-action',
);

export const changeBootstrapSizeAction = actionCreator<number>(
  'change-bootstrap-size',
);

export const changeCrossValidationSize = actionCreator<number>(
  'change-cross-validation-size',
);

export const updateAlgorithmListAction = actionCreator<IAlgorithmInfo>(
  'toggle-algorithm-list',
);

export const updateBootstrapProgressAction = actionCreator<IProgress>(
  'update-bootstrap-progress',
);

export const updateCrossValidationProgressAction = actionCreator<IProgress>(
  'update-cross-validation-progress',
);

export const clearBootstrapProgressBarAction = actionCreator<void>(
  'clear-bootstrap-progress-bar',
);

export const clearCrossValidationProgressBarAction = actionCreator<void>(
  'clear-cross-validation-progress-bar',
);

export const updateMdsProgressAction = actionCreator<IProgress>(
  'update-mds-progress-action',
);

export const clearMdsProgressAction = actionCreator<void>(
  'clear-mds-progress-action',
);

export const registerNowComputation = actionCreator<boolean>('now-computation');
