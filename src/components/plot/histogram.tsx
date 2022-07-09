import React, { useEffect, useMemo, useRef } from 'react';
import { select, sort } from 'd3';
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
import { approx, asCoupled, ICoupled, seq } from './cdfGraph';
import ICore from '../../core/ICore';

interface getHistogram {
  length: number;
  begin: number;
  end: number;
}

export const getHistogram = (
  dat: number[],
  lowerBoundary?: number,
  upperBoundary?: number,
  maxHeight?: number,
  binSize?: number,
): getHistogram[] => {
  const outlier = 0.1;
  const min = SimpleStatistics.min(dat);
  const max = SimpleStatistics.max(dat);
  const _lowerBoundary =
    lowerBoundary === undefined ? min - (max - min) * outlier : lowerBoundary;
  const _upperBoundary =
    upperBoundary === undefined ? max + (max - min) * outlier : upperBoundary;

  const _binSize = binSize === undefined ? 20 : binSize;

  const x = seq(_lowerBoundary, _upperBoundary, _binSize);
  const coupledX = asCoupled<number>(x);
  const sortedDat = dat.sort((a, b) => a - b);

  const bin = coupledX.map(c => {
    return {
      ...c,
      length: sortedDat.filter(d => c.begin <= d && d < c.end).length,
    };
  });

  const maxLength = SimpleStatistics.max(bin.map(d => d.length));
  const _maxHeight = maxHeight === undefined ? maxLength : maxHeight;

  const normalizeBin = bin.map(d => {
    return {
      ...d,
      length: (d.length / maxLength) * _maxHeight,
    };
  });
  return normalizeBin;
};
