import React, { useEffect, useRef } from 'react';
import { select } from 'd3';
import { IDensityEstimation, IPeaksCertainty } from '../../states/IData';
import { viewParam } from './config';
import {
  makeAxis,
  makeBaseLine,
  makeScale,
  makeScatter,
  plotPeaksCertainty,
} from './densityPlotFunctions';
import { ID3Coordinate, IViewParam } from './IPlot';

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

// eslint-disable-next-line react/display-name
export const DensityDiagnosis: React.FC<IDensityDiagnosis> = React.memo(
  props => {
    if (props.densityEstimationResult === undefined) return <></>;
    if (props.densityEstimationResult.density === undefined) return <></>;
    if (props.densityEstimationResult.bootstrapResult === undefined)
      return <></>;

    const baseDensity: [number, number][] =
      props.densityEstimationResult.density
        .filter(d => {
          const min = props.xmin === undefined ? -Infinity : props.xmin;
          const max = props.xmax === undefined ? Infinity : props.xmax;
          return min < d.x && d.x < max;
        })
        .map(d => [d.x, d.y]);

    const bootstrapPeaks: ID3Coordinate[] =
      props.densityEstimationResult.bootstrapResult.bootstrapPeaks
        .filter(d => {
          const min = props.xmin === undefined ? -Infinity : props.xmin;
          const max = props.xmax === undefined ? Infinity : props.xmax;
          return min < d.x && d.x < max;
        })
        .map(d => [d.x, d.y]);

    const peaksCertainty: IPeaksCertainty[] =
      props.densityEstimationResult.bootstrapResult.peaksCertainty.filter(d => {
        const min = props.xmin === undefined ? -Infinity : props.xmin;
        const max = props.xmax === undefined ? Infinity : props.xmax;
        return min < d.mean && d.mean < max;
      });

    const scale = makeScale(
      baseDensity,
      viewParam,
      true,
      props.xmin,
      props.xmax,
    );

    useEffect(() => {
      const group = select(props.refSvg.current);
      group.selectAll('*').remove(); // delete all children

      makeAxis(group, scale, viewParam);
      makeBaseLine(group, scale, baseDensity, props.strokeColor);
      makeScatter(group, scale, bootstrapPeaks, props.bgColor);
      plotPeaksCertainty(group, scale, peaksCertainty);
    }, [scale]);

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={viewParam.width}
        height={viewParam.height}>
        <g ref={props.refSvg} className="diagnosis" />
      </svg>
    );
  },
);
