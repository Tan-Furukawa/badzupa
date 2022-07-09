import React, { useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import IData, {
  IDensityEstimation,
  IPeaksCertainty,
  ISampleStatus,
} from '../states/IData';
import { IState } from '../states/IState';
import styled from 'styled-components';
import IUser, {
  IAlgorithmInfo,
  IDensityEstimationResultDisplay,
} from '../states/IUser';
import { appendDensityDisplayAction } from '../actions/UserActions';
import { IViewParam } from './plot/IPlot';
import { viewParam } from './plot/config';
import { DensityGraph } from './plot/densityGraph';
import { DensityDiagnosis } from './plot/densityDiagnosis';
import { NumberInputBox } from './common/input';
import ColorPicker from './common/colorPicker';
import { ButtonFormat, theme } from './style/FoundationStyles';
import { getCertaintyColor } from './plot/densityPlotFunctions';
import { CdfGraph } from './plot/cdfGraph';

const ResultContainer = styled.div`
  display: flex;
`;

const OperationContainer = styled.div`
  border: 1px solid ${p => p.theme.PRIMARY_4};
  margin-top: 3px;
  box-sizing: border-box;
  line-height: 10px;
  height: ${viewParam.height};
  max-width: 400px;
  flex: 1;
`;

const DensityGraphContainer = styled.div`
  border-bottom: 1px solid ${p => p.theme.PRIMARY_4};
  flex: 1;
`;

const Th = styled.th`
  padding: 10px;
  margin: 0;
  border-bottom: 1px solid ${p => p.theme.PRIMARY_4};
`;

const Td = styled.td`
  padding: 10px;
  text-align: center;
`;

const OuterTableContainer = styled.div`
  box-sizing: border-box;
  padding: 10px;
  max-width: 400px;
  height: ${viewParam.height}px;
`;

const TableContainer = styled.div`
  box-sizing: border-box;
  height: ${viewParam.height * 0.9}px;
  overflow-y: scroll;
`;

const Table = styled.table`
  margin-left: auto;
  margin-right: auto;
`;

const InfoContainer = styled.div`
  box-sizing: border-box;
  max-width: 400px;
  padding: 10px;
  margin-top: 3px;
`;

const StyleContainer = styled.div`
  box-sizing: border-box;
  max-width: 400px;
  padding: 10px;
`;

const IndexTitle = styled.div`
  color: ${p => p.theme.PRIMARY_2};
  font-weight: bold;
  padding-left: 10px;
  border-bottom: 1px solid ${p => p.theme.PRIMARY_2};
  margin-bottom: 10px;
`;

const SubIndex = styled.div`
  padding-left: 20px;
  padding-right: 10px;
  padding-bottom: 5px;
  padding-top: 3px;
`;

interface ICheckBox {
  checked: boolean;
  onChange: () => void;
  label?: string;
  name: string;
}

const CheckBox: React.FC<ICheckBox> = props => {
  const label = props.label;
  return (
    <div>
      <span>{label === undefined ? '' : props.label}</span>
      <input
        type="checkbox"
        name={props.name === undefined ? '' : props.name}
        checked={props.checked}
        onChange={props.onChange}
      />
    </div>
  );
};

interface IOperationTable {
  sampleId: string;
  peaksCertainty?: IPeaksCertainty[];
}

const OperationTable: React.FC<IOperationTable> = props => {
  if (props.peaksCertainty === undefined) return <></>;

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th></Th>
            <Th>mean</Th>
            <Th>2sd</Th>
            <Th>certainty</Th>
          </tr>
        </thead>
        <tbody>
          {props.peaksCertainty.map((d, i: number) => {
            return (
              <tr key={i} style={{ color: getCertaintyColor(d.certainty) }}>
                <Td>{i + 1}</Td>
                <Td>{Math.floor(d.mean * 10) / 10}</Td>
                <Td>{Math.floor(d.sd * 2 * 10) / 10}</Td>
                <Td>{Math.floor(d.certainty * 100)}%</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};

interface IEachResult {
  sampleId: string;
  viewParam: IViewParam;
  sampleStatus?: ISampleStatus;
  densityEstimationResultDisplay: IDensityEstimationResultDisplay[];
  densityEstimationResult: IDensityEstimation[];
}

const EachResult: React.FC<IEachResult> = props => {
  const dispatch = useDispatch();

  const targetDensityRes: IDensityEstimation = {
    ...props.densityEstimationResult.filter(d => {
      return d.sampleId === props.sampleId;
    })[0],
  };
  const estimationParam = { ...{ ...props.sampleStatus }.estimationParam };

  const estimationParamOutput = {
    bootstrapSize:
      estimationParam.bootstrapSize === undefined
        ? ''
        : String(estimationParam.bootstrapSize),
    densityEstimationConfidentLevel:
      estimationParam.densityEstimationConfidentLevel === undefined
        ? ''
        : String(estimationParam.densityEstimationConfidentLevel),
    usedAlgorithmList:
      estimationParam.usedAlgorithmList === undefined
        ? ''
        : String(
            estimationParam.usedAlgorithmList
              .filter(d => d.used)
              .reduce((prev: string, curr: IAlgorithmInfo, index) => {
                if (curr.used) {
                  if (index === 0) {
                    return curr.algorithm;
                  } else {
                    return prev + ',' + curr.algorithm;
                  }
                } else {
                  return prev;
                }
              }, ''),
          ),
    crossValidationSize:
      estimationParam.crossValidationSize === undefined
        ? ''
        : String(estimationParam.crossValidationSize),
  };

  const sampleName = useMemo(() => {
    const name = { ...props.sampleStatus }.sampleName;
    return name === undefined ? '' : name;
  }, [props.sampleStatus]);

  const bootstrapResult = useMemo(
    () => ({ ...targetDensityRes.bootstrapResult }),
    [targetDensityRes],
  );
  const peaksCertainty = useMemo(
    () => bootstrapResult.peaksCertainty,
    [bootstrapResult],
  );
  const usedAlgorithm = useMemo(() => {
    return targetDensityRes.bestAlgorithm === undefined
      ? ''
      : targetDensityRes.bestAlgorithm;
  }, [targetDensityRes.bestAlgorithm]);

  const display = useMemo(
    () => ({
      ...props.densityEstimationResultDisplay.filter(
        d => d.sampleId === props.sampleId,
      )[0],
    }),
    [props.densityEstimationResultDisplay],
  );

  const displayStrokeColorPicker = useMemo(() => {
    return display.displayStrokeColorPicker === undefined
      ? false
      : display.displayStrokeColorPicker;
  }, [display.displayStrokeColorPicker]);

  const displayBgColorPicker = useMemo(() => {
    return display.displayBgColorPicker === undefined
      ? false
      : display.displayBgColorPicker;
  }, [display.displayBgColorPicker]);

  const strokeColor = useMemo(() => {
    return display.strokeColor === undefined
      ? theme.DENSITY_CURVE
      : display.strokeColor;
  }, [display.strokeColor]);

  const bgColor = useMemo(() => {
    return display.bgColor === undefined ? theme.DENSITY_AREA : display.bgColor;
  }, [display.bgColor]);

  const showCDF = useMemo(() => {
    return display.showCDF === undefined ? false : !display.showCDF;
  }, [display.showCDF]);

  const showHistogram = useMemo(() => {
    return display.showHistogram === undefined ? false : !display.showHistogram;
  }, [display.showHistogram]);

  const onChangeInputMaxValue = useCallback(
    (value: number) => {
      dispatch(
        appendDensityDisplayAction({
          sampleId: props.sampleId,
          xmax: value,
        }),
      );
    },
    [props.sampleId],
  );

  const onChangeInputMinValue = useCallback(
    (value: number) => {
      dispatch(
        appendDensityDisplayAction({
          sampleId: props.sampleId,
          xmin: value,
        }),
      );
    },
    [props.sampleId],
  );

  const onSelectBgColorPicker = useCallback(
    (color: string | undefined) => {
      dispatch(
        appendDensityDisplayAction({
          sampleId: props.sampleId,
          bgColor: color,
        }),
      );
    },
    [props.sampleId, display.bgColor],
  );

  const onSelectStrokeColorPicker = useCallback(
    (color: string | undefined) => {
      dispatch(
        appendDensityDisplayAction({
          sampleId: props.sampleId,
          strokeColor: color,
        }),
      );
    },
    [props.sampleId, display.strokeColor],
  );

  const onClickStrokeColorPicker = useCallback(
    (displayColorPicker: boolean) => {
      dispatch(
        appendDensityDisplayAction({
          sampleId: props.sampleId,
          displayStrokeColorPicker: displayColorPicker,
        }),
      );
    },
    [props.sampleId],
  );

  const onClickBgColorPicker = useCallback(
    (displayColorPicker: boolean) => {
      dispatch(
        appendDensityDisplayAction({
          sampleId: props.sampleId,
          displayBgColorPicker: displayColorPicker,
        }),
      );
    },
    [props.sampleId],
  );

  const onChangeShowHistogram = useCallback(() => {
    dispatch(
      appendDensityDisplayAction({
        sampleId: props.sampleId,
        showHistogram: showHistogram,
      }),
    );
  }, [props.sampleId, showHistogram]);

  const onChangeShowCDF = useCallback(() => {
    dispatch(
      appendDensityDisplayAction({
        sampleId: props.sampleId,
        showCDF: showCDF,
      }),
    );
  }, [props.sampleId, showCDF]);

  const refBaseDens = useRef(null);
  const refDiagnosis = useRef(null);

  const saveBaseDensityAsPDF = useCallback(() => {
    const s = new XMLSerializer();
    if (refBaseDens.current !== null) {
      const str = s.serializeToString(refBaseDens.current);
      window.core.saveAsPDF(str);
    }
  }, [refBaseDens]);

  const saveDiagnosisAsPDF = useCallback(() => {
    const s = new XMLSerializer();
    if (refDiagnosis.current !== null) {
      const str = s.serializeToString(refDiagnosis.current);
      window.core.saveAsPDF(str);
    }
  }, [refDiagnosis]);

  return (
    <>
      <ResultContainer>
        <DensityGraphContainer>
          <DensityGraph
            refSvg={refBaseDens}
            sampleId={props.sampleId}
            viewParam={props.viewParam}
            xmin={display.xmin}
            xmax={display.xmax}
            densityEstimationResult={targetDensityRes}
            strokeColor={strokeColor}
            bgColor={bgColor}
            showHistogram={showHistogram}
          />
          {showCDF ? (
            <CdfGraph
              refSvg={refDiagnosis}
              sampleId={props.sampleId}
              viewParam={props.viewParam}
              xmin={display.xmin}
              xmax={display.xmax}
              densityEstimationResult={targetDensityRes}
              strokeColor={strokeColor}
              bgColor={bgColor}
            />
          ) : (
            <DensityDiagnosis
              refSvg={refDiagnosis}
              sampleId={props.sampleId}
              viewParam={props.viewParam}
              xmin={display.xmin}
              xmax={display.xmax}
              densityEstimationResult={targetDensityRes}
              strokeColor={strokeColor}
              bgColor={bgColor}
            />
          )}
        </DensityGraphContainer>
        <OperationContainer>
          <InfoContainer>
            <IndexTitle> parameters </IndexTitle>
            <SubIndex> sample: {sampleName} </SubIndex>
            <SubIndex> algorithm: {usedAlgorithm} </SubIndex>
            <SubIndex>
              {' '}
              cross validation size: {
                estimationParamOutput.crossValidationSize
              }{' '}
            </SubIndex>
            <SubIndex>
              {' '}
              bootstrap size: {estimationParamOutput.bootstrapSize}{' '}
            </SubIndex>
            <SubIndex>
              {' '}
              used confidence level of CI:{' '}
              {estimationParamOutput.densityEstimationConfidentLevel}%{' '}
            </SubIndex>
            <SubIndex>
              {' '}
              used algorithm list: {
                estimationParamOutput.usedAlgorithmList
              }{' '}
            </SubIndex>
          </InfoContainer>
          <OuterTableContainer>
            <IndexTitle> age and certainty </IndexTitle>
            <TableContainer>
              <OperationTable
                sampleId={props.sampleId}
                peaksCertainty={peaksCertainty}
              />
            </TableContainer>
          </OuterTableContainer>
          <StyleContainer>
            <IndexTitle> operation </IndexTitle>
            <SubIndex>
              min age:{' '}
              <NumberInputBox onChangeVal={onChangeInputMinValue} type="text" />{' '}
              max age:{' '}
              <NumberInputBox onChangeVal={onChangeInputMaxValue} type="text" />
            </SubIndex>
            <SubIndex>
              stroke:{' '}
              <ColorPicker
                color={strokeColor}
                displayColorPicker={displayStrokeColorPicker}
                handleClick={onClickStrokeColorPicker}
                handleColorChange={onSelectStrokeColorPicker}
              />{' '}
              background:{' '}
              <ColorPicker
                color={bgColor}
                displayColorPicker={displayBgColorPicker}
                handleClick={onClickBgColorPicker}
                handleColorChange={onSelectBgColorPicker}
              />
            </SubIndex>
            <SubIndex>
              <ButtonFormat onClick={saveBaseDensityAsPDF}>
                {' '}
                save curve as PDF{' '}
              </ButtonFormat>
              <ButtonFormat onClick={saveDiagnosisAsPDF}>
                {' '}
                {showCDF ? 'save CDF' : 'save peaks PDF'}
              </ButtonFormat>
              <CheckBox
                label="show Histogram"
                name="showHistogram"
                checked={showHistogram}
                onChange={() => {
                  onChangeShowHistogram();
                }}
              />
              <CheckBox
                label="show CDF"
                name="showCDF"
                checked={showCDF}
                onChange={() => {
                  onChangeShowCDF();
                }}
              />
            </SubIndex>
          </StyleContainer>
        </OperationContainer>
      </ResultContainer>
    </>
  );
};

export const ResultView: React.FC = () => {
  const { densityEstimationResult, sampleStatusList } = useSelector<
    IState,
    IData
  >(a => a.data);
  const { densityEstimationResultDisplay } = useSelector<IState, IUser>(
    a => a.user,
  );

  return (
    <>
      {densityEstimationResult.length !== 0 ? (
        densityEstimationResult.map((d, index: number) => {
          return (
            <EachResult
              key={index}
              sampleId={d.sampleId}
              sampleStatus={sampleStatusList.find(
                s => s.sampleId === d.sampleId,
              )}
              viewParam={viewParam}
              densityEstimationResult={densityEstimationResult}
              densityEstimationResultDisplay={densityEstimationResultDisplay}
            />
          );
        })
      ) : (
        <p style={{ fontSize: '2em', color: theme.PRIMARY_4 }}>No result</p>
      )}
    </>
  );
};
