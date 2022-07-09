import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { ISampleStatus } from '../states/IData';
import styled from 'styled-components';
import IData from '../states/IData';
import { IState } from '../states/IState';
import { useSelector } from 'react-redux';
import {
  addSampleStatusToJSON,
  clearDensityEstimationResultFromStateAction,
  deleteAgeDataFromDB,
  deleteSampleStatusList,
  getSelectedAgeDataList,
  setSampleListForMdsAction,
  toggleSampleListCheckAction,
} from '../actions/DataActions';
import { ButtonFormat, theme } from './style/FoundationStyles';
import {
  changeViewAction,
  clearBootstrapProgressBarAction,
  clearCrossValidationProgressBarAction,
  clearMdsProgressAction,
  deleteFailedMessageAction,
  sendFailedMessageAction,
} from '../actions/UserActions';
import IUser, { IAlgorithmInfo } from '../states/IUser';

const Th = styled.th`
  padding: 10px;
  margin: 0;
  border-bottom: 1px solid ${p => p.theme.PRIMARY_4};
`;

const TdStyle = styled.td`
  text-align: center;
`;

const TdCheckBox = styled.td`
  text-align: center;
`;

const TdDone = styled.td`
  text-align: center;
  span {
    color: ${p => p.theme.PRIMARY_2};
    pointer-events: none;
    font-size: 1.5em;
  }
`;

const TdDelete = styled.td`
  text-align: center;
`;

const ButtonDelete = styled.button`
  border: none;
  padding: 0;
  margin: 0;
  background-color: transparent;
  color: ${p => p.theme.PRIMARY_4};
  font-size: 1.5em;
  cursor: pointer;
  &:hover {
    color: ${p => p.theme.PRIMARY_3};
  }
  &:active {
    color: ${p => p.theme.PRIMARY_3};
  }
`;

const SampleList = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 80%;
  overflow-y: scroll;
`;

const StartButtonContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 10%;
`;

const BlankRect = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 10%;
`;

// const TableContainer = styled.div`
//   display: block;
//   white-space: nowrap;
//   -webkit-overflow-scrolling: touch;
//   overflow-y: scroll;
// `;

interface IDeleteSampleButton {
  sampleId: string;
  sampleName: string;
  onClickEvent: (sampleId: string) => void;
}

const DeleteSampleButton: React.FC<IDeleteSampleButton> = props => {
  const onClick = useCallback(() => {
    // if (window.confirm(`Do you really delete sample ${props.sampleName}?`)) {
    props.onClickEvent(props.sampleId);
    // }
  }, [props.sampleId, props.onClickEvent]);
  return (
    <>
      <ButtonDelete onClick={onClick}>×</ButtonDelete>
    </>
  );
};

interface ICheckBox {
  name: string;
  id: string;
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckBox: React.FC<ICheckBox> = props => {
  return (
    <>
      <input
        type="checkbox"
        name={props.name}
        value={props.id}
        checked={props.checked}
        onChange={props.onChange}
      />
    </>
  );
};

const SampleListView: React.FC = () => {
  const dispatch = useDispatch();

  const { sampleStatusList } = useSelector<IState, IData>(a => a.data);
  const { estimationParamInput, nowComputation } = useSelector<IState, IUser>(
    a => a.user,
  );
  const algorithmList = estimationParamInput.usedAlgorithmList;

  const checkedSampleStatus = sampleStatusList.filter(d => d.selected);

  const onClickDeleteSampleButton = useCallback(
    // TODO deleteすると空のグラフがくわわる
    async (sampleId: string) => {
      if (nowComputation) {
        alert('stop computation to continue');
      } else {
        await deleteSampleStatusList(sampleId, dispatch, sampleStatusList);
        await deleteAgeDataFromDB(sampleId, dispatch);
      }
    },
    [sampleStatusList, nowComputation],
  );

  const onChangeCheckBox = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        toggleSampleListCheckAction({
          id: e.target.value,
          checked: e.target.checked,
        }),
      );
    },
    [],
  );

  const validation = useCallback((): boolean => {
    let isValidationOK = true;
    if (checkedSampleStatus.length === 0) {
      isValidationOK = false;
      dispatch(
        sendFailedMessageAction({
          id: 'error-data-size',
          msg: 'Error: No sample is selected',
          status: 'error',
        }),
      );
    }
    if (algorithmList.filter((d: IAlgorithmInfo) => d.used).length === 0) {
      isValidationOK = false;
      dispatch(
        sendFailedMessageAction({
          id: 'error-algorithm-list-size',
          msg: 'Error: No algorithm is selected',
          status: 'error',
        }),
      );
    }
    return isValidationOK;
  }, [checkedSampleStatus, algorithmList]);

  const onClickGetDensityButton = useCallback(async () => {
    if (nowComputation) {
      alert('stop computation to continue');
    } else {
      if (validation()) {
        // checkedIds.forEach(d => {
        //   getAgeDataList(dispatch, d.sampleId);
        // });

        // 一回JSONに登録した値は消すまで更新されないの原則
        for (const sampleStatus of checkedSampleStatus) {
          await addSampleStatusToJSON(dispatch, {
            ...sampleStatus,
            estimationParam: estimationParamInput,
          });
        }

        dispatch(clearDensityEstimationResultFromStateAction());
        dispatch(clearBootstrapProgressBarAction());
        dispatch(clearCrossValidationProgressBarAction());
        dispatch(clearMdsProgressAction());

        // ここで推定されるべきsampleIdがdensityEstimationResultにセットされる
        getSelectedAgeDataList(
          dispatch,
          checkedSampleStatus.map(d => d.sampleId),
        );

        dispatch(deleteFailedMessageAction('error-data-size'));
        dispatch(deleteFailedMessageAction('error-algorithm-list-size'));
        dispatch(changeViewAction('analysis'));
      }
    }
  }, [checkedSampleStatus, nowComputation]);

  const onClickGetMdsButton = useCallback(async () => {
    if (nowComputation) {
      alert('stop computation to continue');
    } else {
      if (validation()) {
        // checkedIds.forEach(d => {
        //   getAgeDataList(dispatch, d.sampleId);
        // });

        // 一回JSONに登録した値は消すまで更新されないの原則
        // for (const sampleStatus of checkedSampleStatus) {
        //   await addSampleStatusToJSON(dispatch, {
        //     ...sampleStatus,
        //     estimationParam: estimationParamInput,
        //   });
        // }

        // dispatch(clearDensityEstimationResultFromStateAction());
        // dispatch(clearBootstrapProgressBarAction());
        // dispatch(clearCrossValidationProgressBarAction());

        // ここで推定されるべきsampleIdがdensityEstimationResultにセットされる
        if (checkedSampleStatus.length < 3) {
          dispatch(
            sendFailedMessageAction({
              id: 'mds-size-error',
              msg: 'select more than 3 samples',
              status: 'error',
            }),
          );
        } else {
          dispatch(
            setSampleListForMdsAction({
              sampleIds: checkedSampleStatus.map(d => d.sampleId),
            }),
          );
          dispatch(deleteFailedMessageAction('error-data-size'));
          dispatch(deleteFailedMessageAction('error-algorithm-list-size'));
          dispatch(changeViewAction('analysis'));
        }
      }
    }
  }, [checkedSampleStatus, nowComputation]);

  return (
    <>
      <SampleList>
        {/* <TableContainer> */}
        <table>
          <thead>
            <tr>
              <Th>sample</Th>
              <Th>style</Th>
              <Th>select</Th>
              <Th>done</Th>
              <Th>reset</Th>
            </tr>
          </thead>
          <tbody>
            {sampleStatusList.map(d => {
              return (
                <tr key={d.sampleId}>
                  <td>{d.sampleName}</td>
                  <TdStyle>U-Pb age</TdStyle>
                  <TdCheckBox>
                    {d.selected === undefined || d.selected === false ? (
                      <CheckBox
                        name="aa"
                        id={d.sampleId}
                        checked={false}
                        onChange={onChangeCheckBox}
                      />
                    ) : (
                      <CheckBox
                        name="aa"
                        id={d.sampleId}
                        checked={true}
                        onChange={onChangeCheckBox}
                      />
                    )}
                  </TdCheckBox>
                  <TdDone>{d.done === 1 ? <span>●</span> : <></>}</TdDone>
                  <TdDelete>
                    <DeleteSampleButton
                      sampleName={d.sampleName}
                      sampleId={d.sampleId}
                      onClickEvent={onClickDeleteSampleButton}
                    />
                  </TdDelete>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* </TableContainer> */}
      </SampleList>
      <BlankRect></BlankRect>
      <StartButtonContainer>
        <ButtonFormat
          onClick={onClickGetDensityButton}
          style={
            sampleStatusList.length === 0
              ? { backgroundColor: theme.PRIMARY_4 }
              : { backgroundColor: theme.PRIMARY_2 }
          }>
          get density
        </ButtonFormat>
        <ButtonFormat
          onClick={onClickGetMdsButton}
          style={
            sampleStatusList.length === 0
              ? { backgroundColor: theme.PRIMARY_4 }
              : { backgroundColor: theme.PRIMARY_2 }
          }>
          get MDS
        </ButtonFormat>
      </StartButtonContainer>
    </>
  );
};

export default SampleListView;
