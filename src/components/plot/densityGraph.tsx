import React, { useEffect, useMemo, useRef } from 'react';
import { select } from 'd3';
import { IDensityEstimation } from '../../states/IData';
import { viewParam } from './config';
import {
  makeAxis,
  makeBaseLine,
  makeCi,
  makeScale,
} from './densityPlotFunctions';
import { IViewParam } from './IPlot';
import { getHistogram } from './histogram';
import * as SimpleStatistics from 'simple-statistics';

interface IDensityGraph {
  refSvg: React.MutableRefObject<any>;
  viewParam: IViewParam;
  sampleId: string;
  xmax?: number;
  xmin?: number;
  densityEstimationResult?: IDensityEstimation;
  bgColor: string;
  strokeColor: string;
  showHistogram: boolean;
}

export const DensityGraph: React.FC<IDensityGraph> = props => {
  if (props === undefined) return <></>;
  if (props.densityEstimationResult === undefined) return <></>;
  if (props.densityEstimationResult.density === undefined) return <></>;

  const dat = props.densityEstimationResult.data;

  const baseDensity: [number, number][] = useMemo(() => {
    if (props === undefined) return [];
    if (props.densityEstimationResult === undefined) return [];
    if (props.densityEstimationResult.density === undefined) return [];
    return props.densityEstimationResult.density
      .filter(d => {
        const min = props.xmin === undefined ? -Infinity : props.xmin;
        const max = props.xmax === undefined ? Infinity : props.xmax;
        return min < d.x && d.x < max;
      })
      .map(d => [d.x, d.y]);
  }, [props.densityEstimationResult.density, props.xmax, props.xmin]);

  const bootRes = { ...props.densityEstimationResult.bootstrapResult };

  const upperCi: [number, number][] = useMemo(() => {
    return bootRes.ci !== undefined
      ? bootRes.ci
          .filter(d => {
            const min = props.xmin === undefined ? -Infinity : props.xmin;
            const max = props.xmax === undefined ? Infinity : props.xmax;
            return min < d.x && d.x < max;
          })
          .map(d => [d.x, d.upperCi])
      : [];
  }, [bootRes.ci]);

  const lowerCi: [number, number][] = useMemo(() => {
    return bootRes.ci !== undefined
      ? bootRes.ci
          .filter(d => {
            const min = props.xmin === undefined ? -Infinity : props.xmin;
            const max = props.xmax === undefined ? Infinity : props.xmax;
            return min < d.x && d.x < max;
          })
          .map(d => [d.x, d.lowerCi])
      : [];
  }, [bootRes.ci]);

  const ciBoth = useMemo(
    () => upperCi.concat(lowerCi.reverse()),
    [upperCi, lowerCi],
  );

  const ref = useRef(null);

  const scale = makeScale(baseDensity, viewParam, true, props.xmin, props.xmax);

  useEffect(() => {
    const group = select(props.refSvg.current);
    group.selectAll('*').remove(); // delete all children
    makeAxis(group, scale, viewParam);
    if (ciBoth.length !== 0) {
      makeCi(group, scale, ciBoth, undefined, props.bgColor);
    }
    if (props.showHistogram) {
      try {
        if (baseDensity.length > 0) {
          const baseMinX = SimpleStatistics.min(baseDensity.map(d => d[0]));
          const baseMaxX = SimpleStatistics.max(baseDensity.map(d => d[0]));
          const baseMaxY = SimpleStatistics.max(baseDensity.map(d => d[1]));

          const hist = getHistogram(
            dat.map(d => d.age),
            baseMinX,
            baseMaxX,
            baseMaxY,
            20,
          );

          hist.forEach(h => {
            makeCi(
              group,
              scale,
              [
                [h.begin, 0],
                [h.end, 0],
                [h.end, h.length],
                [h.begin, h.length],
                [h.begin, 0],
              ],
              '#888',
            );
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    makeBaseLine(group, scale, baseDensity, props.strokeColor);
  }, [scale]);

  return (
    <svg width={viewParam.width} height={viewParam.height}>
      <g ref={props.refSvg} className="densityPlot" />
    </svg>
  );
};
