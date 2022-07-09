export type status =
  | 'testing'
  | 'doNothing'
  | 'baseDensityEstimation'
  | 'crossValidation'
  | 'bootstrapping';

export type algorithm =
  | 'adeba'
  | 'botev'
  | 'sj'
  | 'custom'
  | 'default'
  | 'undefined';

export default interface IRstatus {
  status: status;
  msg?: string;
  progress?: number;
  failedMessage: [];
}
