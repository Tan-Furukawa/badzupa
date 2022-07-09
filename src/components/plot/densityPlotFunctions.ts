import {
  axisBottom,
  axisLeft,
  line,
  max,
  min,
  ScaleLinear,
  scaleLinear,
  Selection,
} from 'd3';
import { useMemo } from 'react';
import { ICoordinate, IPeaksCertainty } from '../../states/IData';
import { theme } from '../style/FoundationStyles';
import { ID3Coordinate, IViewParam } from './IPlot';

interface IScale {
  scaleX: ScaleLinear<number, number, never>;
  scaleY: ScaleLinear<number, number, never>;
}

// eslint-disable-next-line react/display-name
export const makeScale = (
  baseDensity: ID3Coordinate[],
  viewParam: IViewParam,
  baseIsZero: boolean,
  xmin?: number,
  xmax?: number,
  outlier?: number,
) => {
  let minX = useMemo(
    () => (xmin === undefined ? min(baseDensity, a => a[0]) : xmin),
    [baseDensity],
  );
  let maxX = useMemo(
    () => (xmax === undefined ? max(baseDensity, a => a[0]) : xmax),
    [baseDensity],
  );
  // const minX = min(baseDensity, a => a[0]);
  // const maxX = max(baseDensity, a => a[0]);
  let maxY = useMemo(() => max(baseDensity, a => a[1]), [baseDensity]);
  let minY = useMemo(() => {
    return baseIsZero ? 0 : min(baseDensity, a => a[1]);
  }, [baseDensity, baseIsZero]);

  if (
    minX !== undefined &&
    maxX !== undefined &&
    minY !== undefined &&
    maxY !== undefined
  ) {
    if (outlier !== undefined) {
      minX = minX - (maxX - minX) * outlier;
      maxX = maxX + (maxX - minX) * outlier;
      minY = minY - (maxY - minY) * outlier;
      maxY = maxY + (maxY - minY) * outlier;
    }
  }

  const rx = useMemo(() => {
    return scaleLinear()
      .domain([minX === undefined ? 0 : minX, maxX === undefined ? 0 : maxX])
      .range([viewParam.padding, viewParam.width - viewParam.padding]);
  }, [minX, maxX]);

  const ry = useMemo(() => {
    return scaleLinear()
      .domain([minY === undefined ? 0 : minY, maxY === undefined ? 0 : maxY])
      .range([viewParam.height - viewParam.padding, viewParam.padding]);
  }, [maxY]);

  return { scaleX: rx, scaleY: ry };
};

export function makeAxis(
  group: Selection<any, unknown, null, undefined>,
  scale: IScale,
  viewParam: IViewParam,
  yTicks?: number | null,
) {
  const axisx = axisBottom(scale.scaleX);
  const axisy = (yTicks => {
    if (yTicks === undefined) {
      return axisLeft(scale.scaleY).ticks(1);
    } else if (yTicks === null) {
      return axisLeft(scale.scaleY);
    } else {
      return axisLeft(scale.scaleY).ticks(yTicks);
    }
  })(yTicks);

  const x = group
    .append('g')
    .attr('fill', 'black')
    .attr('stroke', 'black')
    .attr('class', 'axis axis-x');

  const y = group
    .append('g')
    .attr('fill', 'black')
    .attr('stroke', 'black')
    .attr('class', 'axis axis-y');

  x.attr(
    'transform',
    `translate(0, ${viewParam.height - viewParam.padding})`,
  ).call(axisx);
  y.attr('transform', `translate(${viewParam.padding}, 0)`).call(axisy);
}

export function makeCi(
  group: Selection<any, unknown, null, undefined>,
  scale: IScale,
  ciBoth: ID3Coordinate[],
  border?: string,
  bgColor?: string,
) {
  const createLine = line()
    .x(d => scale.scaleX(d[0]))
    .y(d => scale.scaleY(d[1]));

  const ci = group
    .append('path')
    .attr('d', createLine(ciBoth))
    .attr('stroke', border === undefined ? 'none' : border)
    .attr('fill', bgColor === undefined ? 'none' : bgColor);
}

export function makeBaseLine(
  group: Selection<any, unknown, null, undefined>,
  scale: IScale,
  baseDensity: ID3Coordinate[],
  color: string,
) {
  const createLine = line()
    .x(d => scale.scaleX(d[0]))
    .y(d => scale.scaleY(d[1]));
  const lineGraph = group
    .append('path')
    .attr('d', createLine(baseDensity))
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('fill', 'none');
}

export function makeScatter(
  group: Selection<any, unknown, null, undefined>,
  scale: IScale,
  points: ID3Coordinate[],
  color: string,
  size?: number,
) {
  const scatter = group
    .append('g')
    .selectAll('circle')
    .data(points)
    .enter()
    .append('circle')
    .attr('cx', function (d: ID3Coordinate) {
      return scale.scaleX(d[0]);
    })
    .attr('cy', function (d: ID3Coordinate) {
      return scale.scaleY(d[1]);
    })
    .attr('fill', color)
    .attr('r', size === undefined ? 1 : size);
}

export function getCertaintyColor(pi: number): string {
  if (pi >= 0.9) {
    return theme.CERTAIN_LEVEL0;
  } else if (0.7 <= pi && pi < 0.9) {
    return theme.CERTAIN_LEVEL1;
  } else if (0.5 <= pi && pi < 0.7) {
    return theme.CERTAIN_LEVEL2;
  } else {
    return theme.CERTAIN_LEVEL3;
  }
}

interface IPeaksCertaintyWithIndex extends IPeaksCertainty {
  id: number;
}

export function plotPeaksCertainty(
  group: Selection<any, unknown, null, undefined>,
  scale: IScale,
  peakCertainty?: IPeaksCertainty[],
) {
  const peakCertaintyWithIndex =
    peakCertainty !== undefined
      ? peakCertainty.map((d: IPeaksCertainty, i: number) => ({
          ...d,
          id: i,
        }))
      : [];

  group
    .append('g')
    .selectAll('circle')
    .data(peakCertaintyWithIndex)
    .enter()
    .append('polygon')
    .attr('points', '0 0, 5 -10, -5 -10')
    .attr('transform', (d: IPeaksCertaintyWithIndex) => {
      return `translate(${scale.scaleX(d.mean)}, ${scale.scaleY(d.y)})`;
    })
    .attr('fill', (d: IPeaksCertaintyWithIndex) => {
      return getCertaintyColor(d.certainty);
    })
    .attr('stroke', '#696969');

  group
    .append('g')
    .selectAll('text')
    .data(peakCertaintyWithIndex)
    .enter()
    .append('text')
    .style('text-anchor', 'middle')
    .attr('x', (d: IPeaksCertaintyWithIndex) => scale.scaleX(d.mean))
    .attr('y', (d: IPeaksCertaintyWithIndex) => scale.scaleY(d.prominence))
    .attr('dy', '-12px')
    .text((d: IPeaksCertaintyWithIndex) => `Peak ${d.id + 1}`)
    .attr('fill', theme.PRIMARY_1)
    .style('font-size', '14px')
    .style('font-family', '"Open Sans", sans-serif')
    .style('font-weight', '500');
}

interface ICoordinateText extends ICoordinate {
  x: number;
  y: number;
  text: string;
}

export function scatterText(
  group: Selection<any, unknown, null, undefined>,
  scale: IScale,
  textCoordinate: ICoordinateText[],
  color?: string,
) {
  group
    .append('g')
    .selectAll('text')
    .data(textCoordinate)
    .enter()
    .append('text')
    .style('text-anchor', 'middle')
    .attr('x', (d: ICoordinateText) => scale.scaleX(d.x))
    .attr('y', (d: ICoordinateText) => scale.scaleY(d.y))
    .attr('dy', '-10px')
    .text((d: ICoordinateText) => d.text)
    .attr('fill', color === undefined ? theme.PRIMARY_1 : color)
    .style('font-size', '14px')
    .style('font-family', '"Open Sans", sans-serif')
    .style('font-weight', '500');
}
