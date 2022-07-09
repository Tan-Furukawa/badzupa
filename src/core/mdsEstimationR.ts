import R from 'r-script';
// import R from 'r-script';
import { rMsgDir, topDir } from '../params';
import { ICoordinate, ICoordinateId, IMdsEstimation } from '../states/IData';
import fixPath from 'fix-path';
import { IMdsEstimationR } from './IRfuncs';

const mds = async (mdsParams: IMdsEstimation): Promise<IMdsEstimation> => {
  fixPath();
  return new Promise((resolve, reject) => {
    console.log(`${topDir}/algorithm/R/mds.r`);
    console.log(mdsParams);
    const child = R(`${topDir}/algorithm/R/mds.r`)
      // dataにはdirを渡す！！！
      .data({
        dir: rMsgDir,
        NBootstrap: mdsParams.NBootstrap,
        ci: mdsParams.ci,
        dataList: mdsParams.dataList.map(d => {
          return d.data.map(dd => ({ age: dd.age, sampleId: d.sampleId }));
        }),
      })
      .call((err: any, d: any) => {
        if (err) {
          const errMsg = new TextDecoder().decode(err);
          console.error(errMsg);
          reject(err);
        } else {
          console.log(d);
          resolve({
            ...mdsParams,
            centerCoordinate: d.X.map((d: ICoordinate, i: number) => ({
              id: i + 1,
              x: Number(d.x),
              y: Number(d.y),
            })),
            bootstrapCoordinate: d.bootstrapCoordinate.map(
              (d: ICoordinateId) => ({
                id: Number(d.id),
                x: Number(d.x),
                y: Number(d.y),
              }),
            ),
            ellipseCoordinate: d.ellipseCoordinate.map((d: ICoordinateId) => ({
              id: Number(d.id),
              x: Number(d.x),
              y: Number(d.y),
            })),
          } as IMdsEstimation);
        }
      });
    try {
      global.childProcessList.push(child);
    } catch (e) {
      console.error(e);
    }
  });
};

const mdsEstimationR: IMdsEstimationR = {
  mds,
};

export default mdsEstimationR;
