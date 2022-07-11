import React, { useEffect, useMemo, useRef } from 'react';
import { max, min, scaleLinear, select } from 'd3';
import { IDensityEstimation, IMdsEstimation } from '../../states/IData';
import { viewParam, viewParamMds } from './config';
import {
  makeAxis,
  makeCi,
  makeScale,
  makeScatter,
  scatterText,
} from './densityPlotFunctions';
import { IViewParam } from './IPlot';
import { getRandomColor } from './colors';

interface IMdsGraph {
  refSvg: React.MutableRefObject<any>;
  mdsResult: IMdsEstimation;
}

function groupBy<T, K>(arr: T[], fn: (d: T) => K) {
  const keys = [...new Set(arr.map(fn))];
  return keys.reduce((prev: T[][], key: K) => {
    prev.push(arr.filter(d => fn(d) === key));
    return prev;
  }, []);
}

export const MdsGraph: React.FC<IMdsGraph> = props => {
  if (props === undefined) return <></>;
  if (props.mdsResult.ellipseCoordinate === undefined) return <></>;
  if (props.mdsResult.centerCoordinate === undefined) return <></>;

  console.log(props.mdsResult.ellipseCoordinate);
  const ellipseCoordinates = groupBy(props.mdsResult.ellipseCoordinate, d => {
    return d.id;
  });
  console.log(ellipseCoordinates);

  const centerCoordinate = props.mdsResult.centerCoordinate;

  const ref = useRef(null);

  const scale = makeScale(
    props.mdsResult.ellipseCoordinate.map(d => [d.x, d.y]),
    viewParamMds,
    false,
    undefined,
    undefined,
    0.05,
  );

  useEffect(() => {
    const group = select(props.refSvg.current);
    group.selectAll('*').remove(); // delete all children
    makeAxis(group, scale, viewParamMds, null);
    for (let i = 0; i < ellipseCoordinates.length; i++) {
      const ellipseCoordinate = ellipseCoordinates[i];
      console.log(ellipseCoordinate);
      if (ellipseCoordinate.length !== 0) {
        if (ellipseCoordinate[0] === undefined) break;
        const id = { ...ellipseCoordinate[0] }.id;
        const rgb = getRandomColor('hex', 'toy');
        makeCi(
          group,
          scale,
          ellipseCoordinate.map(d => [d.x, d.y]),
          rgb,
        );
        makeScatter(
          group,
          scale,
          centerCoordinate.filter(d => d.id === id).map(d => [d.x, d.y]),
          rgb,
          3,
        );
        scatterText(
          group,
          scale,
          centerCoordinate
            .filter(d => d.id === id)
            .map(d => ({ x: d.x, y: d.y, text: `${d.id}` })),
          rgb,
        );
      }
    }
  }, [scale, ellipseCoordinates]);

  return (
    <svg width={viewParamMds.width} height={viewParamMds.height}>
      <g ref={props.refSvg} className="mdsGraph" />
    </svg>
  );
};
