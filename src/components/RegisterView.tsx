import React, { useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeSampleNameAction,
  deleteFailedMessageAction,
  loadingByAction,
  selectTableOrCsvAction,
  sendFailedMessageAction,
  updateLoadedDataAction,
} from '../actions/UserActions';
import { addAgeDataToDB, addSampleStatusToJSON } from '../actions/DataActions';
import ReactDataSheet from 'react-datasheet';
import IUser from '../states/IUser';
import { IState } from '../states/IState';
import CSVReader, { IFileInfo } from 'react-csv-reader';
import { DataGridStyle } from './style/DataGridStyle';
import 'react-datasheet/lib/react-datasheet.css';
import styled from 'styled-components';
import { InputFormat, ButtonFormat } from './style/FoundationStyles';
import { initUser } from '../reducers/UserReducers';
import { ToggleInputFormat } from './common/input';
import shortid from 'shortid';

// CSS
// ===========================================================================

const registerViewStyleParams = {
  inputContainerHeight: 120,
};

const InputContainer = styled.div`
  box-sizing: border-box;
  padding: 20px;
  height: ${registerViewStyleParams.inputContainerHeight}px;
  width: 100%;
  position: absolute;
`;

const GridContainer = styled.div`
  box-sizing: border-box;
  padding-top: ${registerViewStyleParams.inputContainerHeight}px;
  width: 100%;
  height: 90%;
`;

const GridBox = styled.div`
  box-sizing: border-box;
  margin: 0px 20px 0px 20px;
  width: 80%;
  height: 90%;
  border: 1px solid ${(p): string => p.theme.PRIMARY_4};
  overflow-y: scroll;
`;

const RegisterButtonContainer = styled.div`
  box-sizing: border-box;
  padding-left: 20px;
  width: 100%;
  height: 10%;
`;

// dataGrid
// ===========================================================================
export interface GridElement extends ReactDataSheet.Cell<GridElement, number> {
  value: number | string | null;
  readOnly: boolean;
}

class MyReactDataSheet extends ReactDataSheet<GridElement, number> {} // ただ同じ型なだけ

// You can also strongly type all the Components or SFCs that you pass into ReactDataSheet.
// 以下開発中
// 不適切な入力を警告する機能
const cellRenderer: ReactDataSheet.CellRenderer<GridElement, number> = (
  props: ReactDataSheet.CellRenderer<GridElement, number>,
) => {
  const isReadOnly = props.cell.readOnly;
  const backgroundStyle =
    (isNaN(parseFloat(props.cell.value)) || props.cell.value < 0) && !isReadOnly
      ? { color: 'red' }
      : undefined;
  const className = ` cell${props.selected ? ' selected' : ''}${
    isReadOnly ? ' value-viewer' : ''
  }${props.col === 0 ? ' rowHeader' : ''}${props.row === 0 ? ' header' : ''} `;
  return (
    <td
      style={backgroundStyle}
      onMouseDown={props.onMouseDown}
      onMouseOver={props.onMouseOver}
      onDoubleClick={props.onDoubleClick}
      onContextMenu={props.onContextMenu}
      className={className}>
      {props.children}
    </td>
  );
};

interface GridState {
  grid: GridElement[][]; // 二次元配列
  // props: IProps;
  // onChangeGrid: (grid:GridElement[][]) => GridElement[][];
}

const Grid: React.FC = props => {
  const { loadedData, loadingBy } = useSelector<IState, IUser>(a => a.user);
  const dispatch = useDispatch();

  const valueRenderer = (cell: GridElement) => cell.value;
  const grid = loadedData;
  const maxLengthOfData = initUser.loadedData.length;
  const isLargeData = grid.length > maxLengthOfData;

  const changeCells = useCallback(
    (changes: ReactDataSheet.CellsChangedArgs<GridElement, number>) => {
      changes.forEach(({ cell, row, col, value }) => {
        grid[row][col] = { ...grid[row][col], value };
      });
      const lastElemAge = grid.slice(-1)[0][1].value;
      // Error at when last element (:301) is Number type ....
      if (!isNaN(parseFloat(lastElemAge as string)) && !isLargeData) {
        console.log('Error: too large data size for data grid');
        dispatch(
          sendFailedMessageAction({
            id: 'error-data-size',
            msg: 'Error: The data size must be smaller than 300 if you use data grid; use CSV instead',
            status: 'error',
          }),
        );
      } else {
        dispatch(deleteFailedMessageAction('error-data-size'));
      }
      dispatch(updateLoadedDataAction(grid));
      dispatch(deleteFailedMessageAction('error-no-data'));
    },
    [grid],
  );

  const onClickUnsetButton = useCallback(() => {
    dispatch(updateLoadedDataAction(initUser.loadedData));
    dispatch(loadingByAction('grid'));
  }, []);

  return (
    <>
      <p>
        {loadingBy === 'csv' ? (
          <ButtonFormat onClick={onClickUnsetButton}>unset data</ButtonFormat>
        ) : (
          ''
        )}
      </p>
      <p>{isLargeData ? `Omit the 300th line and after.` : ``}</p>
      <div style={{ pointerEvents: isLargeData ? 'none' : 'unset' }}>
        <MyReactDataSheet
          data={
            !isLargeData ? grid : grid.filter((d, i) => i < maxLengthOfData)
          }
          valueRenderer={valueRenderer}
          onContextMenu={(e, cell: GridElement, i: number, j: number) =>
            cell.readOnly ? e.preventDefault() : null
          }
          // parsePaste={onPasteData}
          onCellsChanged={changeCells}
          cellRenderer={cellRenderer}
        />
      </div>
    </>
  );
};

// SampleNameBox
// ===========================================================================
const SampleNameBox: React.FC = () => {
  const { sampleName } = useSelector<IState, IUser>(a => a.user);
  const dispatch = useDispatch();
  const onChangeSampleName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(changeSampleNameAction(e.target.value));
    },
    [],
  );
  return (
    <>
      <p>
        Sample Name:{' '}
        <InputFormat
          onChange={onChangeSampleName}
          type="text"
          value={sampleName}
        />
      </p>
    </>
  );
};

// RegisterView
// ===========================================================================

const RegisterView: React.FC = () => {
  const dispatch = useDispatch();
  const inputRef: React.RefObject<HTMLInputElement> =
    useRef<HTMLInputElement>(null);
  const {
    loadedData,
    nowSelectDataLoadingMethod,
    failedMessage,
    sampleName,
    nowComputation,
  } = useSelector<IState, IUser>(a => a.user);

  const onToggleDataGrid = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(selectTableOrCsvAction(e.target.name));
    },
    [nowSelectDataLoadingMethod],
    // todo名前入力のstate
  );

  type IValidationData = {
    sampleName: string;
    ageData: {
      age: number;
      sd: number;
    }[];
  };

  const validation = (param: IValidationData): 'failed' | 'ok' => {
    let nError = 0;
    if (param.sampleName === '') {
      nError += 1;
      dispatch(
        sendFailedMessageAction({
          id: 'error-no-sample-name',
          msg: 'Error: fill sample name.',
          status: 'error',
        }),
      );
    } else {
      dispatch(deleteFailedMessageAction('error-no-sample-name'));
    }
    if (param.ageData.length === 0) {
      nError += 1;
      dispatch(
        sendFailedMessageAction({
          id: 'error-no-data',
          msg: 'error: fill data filed.',
          status: 'error',
        }),
      );
    } else {
      dispatch(deleteFailedMessageAction('error-no-data'));
    }

    dispatch(deleteFailedMessageAction('error-data-size'));

    if (nError > 0) {
      return 'failed';
    } else {
      return 'ok';
    }
  };

  const onClickRegisterAction = useCallback(async () => {
    if (nowComputation) {
      alert('stop computation to continue');
    } else {
      const age = loadedData
        .map(d => ({
          age:
            typeof d[1].value === 'number'
              ? d[1].value
              : parseFloat(d[1].value as string),
          sd:
            typeof d[2].value === 'number'
              ? d[2].value
              : parseFloat(d[2].value as string),
        }))
        .filter((d): boolean => {
          return !isNaN(d.age);
        });

      const validationRes = validation({
        sampleName: sampleName,
        ageData: age,
      });

      if (validationRes === 'ok') {
        const newSampleId = shortid();
        dispatch(updateLoadedDataAction(initUser.loadedData));
        dispatch(loadingByAction('grid'));

        addAgeDataToDB(dispatch, {
          sampleId: newSampleId,
          data: age,
        });

        addSampleStatusToJSON(dispatch, {
          sampleId: newSampleId,
          done: 0,
          sampleName: sampleName,
        });
      } else {
        alert('Resolve all errors');
      }
    }
  }, [sampleName, loadedData, nowComputation]);

  const onFileLoaded = (data: string[], fileInfo: IFileInfo) => {
    const ageData = data.map((d, i) => {
      return [
        { readOnly: true, value: i + 1 },
        { readOnly: false, value: d[0] === undefined ? '' : d[0] },
        { readOnly: false, value: d[1] === undefined ? '' : d[1] },
      ];
    });
    dispatch(deleteFailedMessageAction('error-no-data'));
    dispatch(deleteFailedMessageAction('error-data-size'));
    dispatch(loadingByAction('csv'));
    dispatch(updateLoadedDataAction(ageData));
    dispatch(selectTableOrCsvAction('dataGrid'));
  };

  // const header = [
  //   [
  //     { value: '', readOnly: true },
  //     { value: 'age', readOnly: true },
  //     { value: '2sd', readOnly: true },
  //   ],
  // ];

  // const elem = loadedData;

  return (
    <>
      <InputContainer>
        <SampleNameBox />

        <div>
          Input format:
          <ToggleInputFormat
            names={['Data Grid', 'CSV']}
            ids={['dataGrid', 'csv']}
            onChange={onToggleDataGrid}
            label={'Input Format:'}
            selectedId={nowSelectDataLoadingMethod}
          />
        </div>

        {/* <div>
          Input format:
          <ToggleInputFormat
            names={['U-Pb age', 'U-Pb isotope']}
            ids={['aaa', 'bbb']}
            onChange={e => console.log(e)}
            label={'Input Data'}
            selectedId={nowSelectDataLoadingMethod}
          />
        </div> */}
      </InputContainer>

      <GridContainer>
        <GridBox>
          {nowSelectDataLoadingMethod === 'csv' && (
            <>
              <div style={{ padding: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p> U-Pb age input format </p>
                </div>
                <br />
                <li> Input format: CSV </li>
                <li> Row 1: Age </li>
                <li> Row 2: Measurement error (2sigma) </li>
                <li> Column name: Row 1:age; Row 2: 2sd</li>
                <br />
                <CSVReader onFileLoaded={onFileLoaded} />
              </div>
            </>
          )}
          {nowSelectDataLoadingMethod === 'dataGrid' && (
            <div className={'container'}>
              <div className={'sheet-container'}>
                <DataGridStyle />
                <Grid />
              </div>
            </div>
          )}
        </GridBox>
      </GridContainer>
      <RegisterButtonContainer>
        <ButtonFormat onClick={onClickRegisterAction}>register</ButtonFormat>
      </RegisterButtonContainer>
    </>
  );
};

export default RegisterView; // 他のファイルから参照できるようにする。
