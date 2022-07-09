import { Dispatch } from 'redux';
import { IProgress } from '../states/IUser';
import {
  updateBootstrapProgressAction,
  updateCrossValidationProgressAction,
  updateMdsProgressAction,
} from './UserActions';

interface IRprogress extends IProgress {
  method: 'bootstrap' | 'crossValidation' | 'mds';
}

export const watchBootstrapResult = async (
  dispatch: Dispatch,
): Promise<void> => {
  window.core.watchFileEvent(`algorithm/Rmessage/bootstrap.txt`, content => {
    const progressInfo: IRprogress = JSON.parse(content);
    if (progressInfo.method === 'bootstrap') {
      dispatch(
        updateBootstrapProgressAction({
          index: progressInfo.index,
          all: progressInfo.all,
        }),
      );
    }
  });
};

export const watchCrossValidationResult = async (
  dispatch: Dispatch,
): Promise<void> => {
  window.core.watchFileEvent(
    `algorithm/Rmessage/crossValidation.txt`,
    content => {
      const progressInfo: IRprogress = JSON.parse(content);
      if (progressInfo.method === 'crossValidation') {
        dispatch(
          updateCrossValidationProgressAction({
            index: progressInfo.index,
            all: progressInfo.all,
          }),
        );
      }
    },
  );
};

export const watchMdsResult = async (dispatch: Dispatch): Promise<void> => {
  window.core.watchFileEvent(`algorithm/Rmessage/mds.txt`, content => {
    const progressInfo: IRprogress = JSON.parse(content);
    if (progressInfo.method === 'mds') {
      dispatch(
        updateMdsProgressAction({
          index: progressInfo.index,
          all: progressInfo.all,
        }),
      );
    }
  });
};
