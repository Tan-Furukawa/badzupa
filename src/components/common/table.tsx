import React from 'react';
import { combinationsReplacement } from 'simple-statistics';
import styled from 'styled-components';
import { ButtonFormat, theme } from './../style/FoundationStyles';

const Th = styled.th`
  padding: 10px;
  margin: 0;
  border-bottom: 1px solid ${p => p.theme.PRIMARY_4};
`;

const Td = styled.td`
  text-align: center;
`;

const SampleList = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 80%;
  overflow-y: scroll;
`;

interface ITable {
  data: string[][];
  colNames: string[];
}

export const Table: React.FC<ITable> = props => {
  const nRow = props.data.map(d => d[0]).length;

  return (
    <>
      {/* <TableContainer> */}
      <table>
        <thead>
          <tr>
            {props.colNames.map((colName, i) => {
              return colName === undefined ? (
                <Th key={i}></Th>
              ) : (
                <Th key={i}>{colName}</Th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {props.data.map((d, i) => {
            return (
              <tr key={i}>
                {d.map((dd, j) => {
                  return <Td key={(nRow + 1) * i + j}>{dd}</Td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
