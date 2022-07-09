import { ChildProcess } from 'child_process';
import { contextBridge } from 'electron';
import core from './core';
import densityEstimationR from './densityEstimationR';
import mdsEstimationR from './mdsEstimationR';
// import initialSetupFunction from './initialSetupR';

contextBridge.exposeInMainWorld('core', core);
contextBridge.exposeInMainWorld('densityEstimationR', densityEstimationR);
contextBridge.exposeInMainWorld('mdsEstimationR', mdsEstimationR);
// contextBridge.exposeInMainWorld('initialSetupFunction', initialSetupFunction);

declare global {
  // eslint-disable-next-line no-var
  var childProcessList: ChildProcess[];
}
global.childProcessList = [];
