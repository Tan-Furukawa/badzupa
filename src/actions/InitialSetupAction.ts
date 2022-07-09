import { actionCreatorFactory } from 'typescript-fsa';
import '../core/ICore';
import { algorithm } from '../states/IR';

const actionCreator = actionCreatorFactory('saga-action');

export const startInitialSetupAction = actionCreator<void>(
  'start-initial-setup',
);

export const getInitialSetupStatusAction = actionCreator<void>(
  'get-initial-setup-status',
);

export const setInitialSetupStatusAction =
  actionCreator<void>('set-initial-setup');
