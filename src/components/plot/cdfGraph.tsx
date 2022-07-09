import React, { useEffect, useMemo, useRef } from 'react';
import { select } from 'd3';
import {
  ICoordinate,
  ICoordinateId,
  IDensityEstimation,
  IPeaksCertainty,
} from '../../states/IData';
import { viewParam } from './config';
import {
  makeAxis,
  makeBaseLine,
  makeCi,
  makeScale,
  makeScatter,
  plotPeaksCertainty,
} from './densityPlotFunctions';
import { ID3Coordinate, IViewParam } from './IPlot';
import * as SimpleStatistics from 'simple-statistics';

interface IDensityDiagnosis {
  sampleId: string;
  viewParam: IViewParam;
  refSvg: React.MutableRefObject<any>;
  xmin?: number;
  xmax?: number;
  densityEstimationResult?: IDensityEstimation;
  bgColor: string;
  strokeColor: string;
}

export const seq = (min: number, max: number, len: number): number[] => {
  const emptyArr = new Array(len).fill(NaN);
  return emptyArr.map((d, i) => {
    return min + ((max - min) / len) * i;
  });
};

const cumSum = (dat: number[]): number[] => {
  const res = dat.reduce((prev: number[], curr: number) => {
    if (prev.length === 0) {
      return prev.concat([curr]);
    } else {
      return prev.concat([prev.slice(-1)[0] + curr]);
    }
  }, []);
  return res;
};

export interface ICoupled<T> {
  begin: T;
  end: T;
}

export const asCoupled = <T,>(x: T[]): ICoupled<T>[] => {
  if (x.length < 2) {
    return [];
  } else {
    const coupled = x
      .map((d: T, i: number) => {
        if (x[i + 1] === undefined) {
          return [];
        } else {
          return [{ begin: x[i], end: x[i + 1] }];
        }
      })
      .flat();
    return coupled;
  }
};

const isIn = (range: [number, number], x: number) => {
  return range[0] <= x && x < range[1] ? true : false;
};

type IApproxFunc = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) => (x: number) => number;

export const approx = (
  input: { x: number; y: number }[],
  xOut: number[],
  yLeft: number,
  yRight: number,
  func: IApproxFunc,
): ICoordinate[] => {
  const coupledXIn = asCoupled<ICoordinate>(
    input.sort((a, b) => a.x - b.x).map(d => d),
  );
  const result0 = coupledXIn.map(c => {
    return xOut
      .filter(d => c.begin.x <= d && d < c.end.x)
      .map(d => ({ x: d, begin: c.begin, end: c.end }));
  });
  const result = result0.flat().map(d => {
    return {
      x: d.x,
      y: func(d.begin.x, d.begin.y, d.end.x, d.end.y)(d.x),
    };
  });

  const reft = xOut
    .filter(d => d < coupledXIn[0].begin.x)
    .map(d => ({ x: d, y: yLeft }));
  const right = xOut
    .filter(d => coupledXIn[coupledXIn.length - 1].end.x <= d)
    .map(d => ({ x: d, y: yRight }));

  return reft.concat(result).concat(right);
};

const getCDF = (
  dat: number[],
  lowerBoundary?: number,
  upperBoundary?: number,
): ICoordinate[] => {
  const arrLen = 512;
  const outlier = 0.1;
  const datLen = dat.length;
  const min = SimpleStatistics.min(dat);
  const max = SimpleStatistics.max(dat);
  const _lowerBoundary =
    lowerBoundary === undefined ? min - (max - min) * outlier : lowerBoundary;
  const _upperBoundary =
    upperBoundary === undefined ? max + (max - min) * outlier : upperBoundary;
  const x = seq(_lowerBoundary, _upperBoundary, arrLen);
  const cumSumRes = dat
    .sort((a, b) => a - b)
    .map((d, i) => ({ x: d, y: i / datLen }));
  const cdf = approx(cumSumRes, x, 0, 1, (x0, y0, x1, y1) => {
    return x => ((y1 - y0) / (x1 - x0)) * (x - x0) + y0;
  });
  return cdf;
};

// eslint-disable-next-line react/display-name
export const CdfGraph: React.FC<IDensityDiagnosis> = React.memo(props => {
  if (props.densityEstimationResult === undefined) return <></>;

  const baseDens = props.densityEstimationResult.density;
  const dat = props.densityEstimationResult.data.map(d => d.age);

  props.densityEstimationResult.data.map(d => {
    return d.age;
  });

  const min =
    baseDens === undefined
      ? undefined
      : SimpleStatistics.min(baseDens.map(d => d.x));
  const max =
    baseDens === undefined
      ? undefined
      : SimpleStatistics.max(baseDens.map(d => d.x));

  const cdf: [number, number][] = getCDF(dat, min, max).map(d => [d.x, d.y]);

  const alpha = 0.1;
  const delta = Math.sqrt((1 / (dat.length * 2)) * Math.log(2 / alpha));

  const cdfUpperCi: [number, number][] = useMemo(() => {
    return cdf.map(d => [d[0], SimpleStatistics.min([1, delta + d[1]])]);
  }, [cdf, delta]);

  const cdfLowerCi: [number, number][] = useMemo(() => {
    return cdf.map(d => [d[0], SimpleStatistics.max([0, d[1] - delta])]);
  }, [cdf, delta]);

  const ciBoth = useMemo(
    () => cdfUpperCi.concat(cdfLowerCi.reverse()),
    [cdfUpperCi, cdfLowerCi],
  );
  const scale = makeScale(cdf, viewParam, true, props.xmin, props.xmax);

  useEffect(() => {
    const group = select(props.refSvg.current);
    group.selectAll('*').remove(); // delete all children

    makeAxis(group, scale, viewParam);
    if (ciBoth.length !== 0) {
      makeCi(group, scale, ciBoth, undefined, props.bgColor);
    }
    makeBaseLine(group, scale, cdf, props.strokeColor);
  }, [scale]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={viewParam.width}
      height={viewParam.height}>
      <g ref={props.refSvg} className="cdf" />
    </svg>
  );
});
