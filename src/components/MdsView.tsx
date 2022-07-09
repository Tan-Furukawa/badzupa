import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import IData, { IAgeData } from '../states/IData';
import { IState } from '../states/IState';
import { MdsGraph } from './plot/mdsGraph';
import styled from 'styled-components';
import { viewParamMds } from './plot/config';
import { ButtonFormat, theme } from './style/FoundationStyles';
// import { execEx, OnlyExec } from '../actions/RAction';

const Table = styled.table`
  margin-left: auto;
  margin-right: auto;
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
const ResultContainer = styled.div`
  display: flex;
`;

const GraphContainer = styled.div`
  border-bottom: 1px solid ${p => p.theme.PRIMARY_4};
  flex: 1;
`;

const OperationContainer = styled.div`
  border: 1px solid ${p => p.theme.PRIMARY_4};
  margin-top: 3px;
  box-sizing: border-box;
  line-height: 10px;
  height: ${viewParamMds.height};
  max-width: 400px;
  flex: 1;
`;

const OuterTableContainer = styled.div`
  box-sizing: border-box;
  padding: 10px;
  max-width: 400px;
  height: ${viewParamMds.height}px;
`;

const SubIndex = styled.div`
  padding-left: 20px;
  padding-right: 10px;
  padding-bottom: 5px;
  padding-top: 3px;
`;

const TableContainer = styled.div`
  box-sizing: border-box;
  height: ${viewParamMds.height * 0.9}px;
  overflow-y: scroll;
`;

const IndexTitle = styled.div`
  color: ${p => p.theme.PRIMARY_2};
  font-weight: bold;
  padding-left: 10px;
  border-bottom: 1px solid ${p => p.theme.PRIMARY_2};
  margin-bottom: 10px;
`;

const InfoContainer = styled.div`
  box-sizing: border-box;
  max-width: 400px;
  padding: 10px;
  margin-top: 3px;
`;

interface IMdsTableContent {
  sampleId: string;
  resultIndex: number;
  name: string;
}

interface IMdsTable {
  sampleInfo: IMdsTableContent[];
}

const OperationTable: React.FC<IMdsTable> = props => {
  if (props.sampleInfo.length === 0) return <></>;
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>index</Th>
            <Th>sample</Th>
          </tr>
        </thead>
        <tbody>
          {props.sampleInfo.map((d, i: number) => {
            return (
              <tr key={i}>
                <Td>{d.resultIndex}</Td>
                <Td>{d.name}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};

export const MdsView: React.FC = () => {
  const { msdResult } = useSelector<IState, IData>(a => a.data);
  const { sampleStatusList } = useSelector<IState, IData>(a => a.data);
  console.log(msdResult);

  const tableInfo: IMdsTableContent[] = useMemo(
    () =>
      msdResult.dataList.map((d: IAgeData, i: number) => {
        const sampleName = {
          ...sampleStatusList.find(dd => dd.sampleId === d.sampleId),
        }.sampleName;
        return {
          sampleId: d.sampleId,
          resultIndex: i + 1,
          name: sampleName === undefined ? '' : sampleName,
        };
      }),
    [msdResult, sampleStatusList],
  );

  const refMdsGraph = useRef(null);

  const saveMdsAsPDF = useCallback(() => {
    const s = new XMLSerializer();
    if (refMdsGraph.current !== null) {
      const str = s.serializeToString(refMdsGraph.current);
      window.core.saveAsPDF(str);
    }
  }, [refMdsGraph]);

  console.log(msdResult);

  return (
    <>
      {msdResult.bootstrapCoordinate !== undefined ? (
        <ResultContainer>
          <GraphContainer>
            <MdsGraph refSvg={refMdsGraph} mdsResult={msdResult} />
          </GraphContainer>
          <OperationContainer>
            <InfoContainer>
              <IndexTitle> parameters </IndexTitle>
              <SubIndex> bootstrap size: {msdResult.NBootstrap} </SubIndex>
              <SubIndex>
                {' '}
                used confidence level of CI: {msdResult.ci}%{' '}
              </SubIndex>
            </InfoContainer>
            <OuterTableContainer>
              <IndexTitle> age and certainty </IndexTitle>
              <TableContainer>
                <OperationTable sampleInfo={tableInfo} />
              </TableContainer>
            </OuterTableContainer>
            <SubIndex>
              <ButtonFormat onClick={saveMdsAsPDF}> save as PDF </ButtonFormat>
            </SubIndex>
          </OperationContainer>
        </ResultContainer>
      ) : (
        <p style={{ fontSize: '2em', color: theme.PRIMARY_4 }}>No result</p>
      )}
    </>
  );
};
