import R from 'r-script';
// import R from 'r-script';
import { rMsgDir, topDir } from '../params';
import { algorithm } from '../states/IR';
import { exec } from 'child_process';
import fixPath from 'fix-path';
import { IInitialSetupFunction } from './IRfuncs';

export const installPackages = async (): Promise<void> => {
  fixPath();
  return new Promise((resolve, reject) => {
    const child = R(`${topDir}/algorithm/R/initialSetup.r`)
      .data()
      .call((err: any, d: any) => {
        if (err) {
          const errMsg = new TextDecoder().decode(err);
          console.error(errMsg);
          reject(err);
        } else {
          console.log('cv done');
        }
      });

    try {
      global.childProcessList.push(child);
    } catch (e) {
      console.error(e);
    }
  });
};

export const checkRscript = async (): Promise<boolean> => {
  fixPath();
  return new Promise((resolve, reject) => {
    const child = exec('Rscript');
    resolve(true);
    try {
      global.childProcessList.push(child);
    } catch (e) {
      console.error(e);
    }
  });
};

const initialSetupFunction: IInitialSetupFunction = {
  installPackages,
  checkRscript,
};

declare global {
  interface Window {
    initialSetupFunction: IInitialSetupFunction;
  }
}

export default initialSetupFunction;
