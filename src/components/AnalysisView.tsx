import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IState } from '../states/IState';
import IUser, { IAlgorithmInfo, IProgress } from '../states/IUser';
import { InputFormat } from './style/FoundationStyles';
import {
  changeBootstrapSizeAction,
  changeConfidentLevelAction,
  changeCrossValidationSize,
  updateAlgorithmListAction,
} from '../actions/UserActions';
import { theme } from './style/FoundationStyles';
import { algorithm } from '../states/IR';
import { watchBootstrapResult } from '../actions/watchAction';
import { styled } from './style/FoundationStyles';
import IData from '../states/IData';
import {
  changeBootstrapSizeAtMdsAction,
  changeConfidentLevelAtMdsAction,
} from '../actions/DataActions';

const ConfidentLevelBox: React.FC = () => {
  const dispatch = useDispatch();
  const { estimationParamInput } = useSelector<IState, IUser>(a => a.user);
  const densityEstimationConfidentLevel =
    estimationParamInput.densityEstimationConfidentLevel;
  const onChangeConfidentLevel = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(changeConfidentLevelAction(Number(e.target.value)));
    },
    [],
  );

  const warningMsg = useMemo(() => {
    return 50 <= densityEstimationConfidentLevel &&
      densityEstimationConfidentLevel <= 99
      ? ''
      : 'invalid input: use 50 to 99%';
  }, [densityEstimationConfidentLevel]);
  return (
    <>
      <InputFormat
        onChange={onChangeConfidentLevel}
        type="number"
        value={densityEstimationConfidentLevel}
      />
      <span style={{ color: theme.PRIMARY_3 }}> {warningMsg} </span>
    </>
  );
};

const CrossValidationSizeBox: React.FC = () => {
  const dispatch = useDispatch();
  const { estimationParamInput } = useSelector<IState, IUser>(a => a.user);

  const crossValidationSize = estimationParamInput.crossValidationSize;

  const onChangeCrossValidationSize = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(changeCrossValidationSize(Number(e.target.value)));
    },
    [],
  );

  const warningMsg = useMemo(() => {
    return crossValidationSize < 2
      ? 'invalid input: larger than 2'
      : crossValidationSize > 10
      ? ''
      : '';
  }, [crossValidationSize]);

  return (
    <>
      <InputFormat
        onChange={onChangeCrossValidationSize}
        type="number"
        value={crossValidationSize}
      />
      <span style={{ color: theme.PRIMARY_3 }}> {warningMsg} </span>
    </>
  );
};

const BootstrapSizeBox: React.FC = () => {
  const dispatch = useDispatch();
  const { estimationParamInput } = useSelector<IState, IUser>(a => a.user);
  const bootstrapSize = estimationParamInput.bootstrapSize;

  const onChangeBootstrapSize = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(changeBootstrapSizeAction(Number(e.target.value)));
    },
    [],
  );

  const warningMsg = useMemo(() => {
    return bootstrapSize < 1
      ? 'invalid input: larger than 1'
      : bootstrapSize > 1000
      ? 'the computation may takes very long'
      : '';
  }, [bootstrapSize]);
  return (
    <>
      <InputFormat
        onChange={onChangeBootstrapSize}
        type="number"
        value={bootstrapSize}
      />
      <span style={{ color: theme.PRIMARY_3 }}> {warningMsg} </span>
    </>
  );
};

interface IAlgorithmListInput {
  algorithmList: IAlgorithmInfo[];
  onChange: (algorithm: IAlgorithmInfo) => void;
}

const algorithmNameGenerator = (algorithm: algorithm) => {
  switch (algorithm) {
    case 'adeba':
      return 'ADEBA';
    case 'sj':
      return 'SJ';
    case 'botev':
      return 'Botev';
    default:
      return algorithm;
  }
};

const AlgorithmListInput: React.FC<IAlgorithmListInput> = props => {
  return (
    <>
      {props.algorithmList.map((d, i) => {
        return (
          <span key={i}>
            <span> {algorithmNameGenerator(d.algorithm)} </span>
            <input
              type="checkbox"
              name={d.algorithm}
              value={d.algorithm}
              checked={d.used}
              onChange={() => props.onChange(d)}
            />{' '}
          </span>
        );
      })}
    </>
  );
};

const BootstrapSizeBoxAtMds: React.FC = () => {
  const dispatch = useDispatch();
  const { msdResult } = useSelector<IState, IData>(a => a.data);

  const bootstrapSize = msdResult.NBootstrap;

  const onChangeCrossValidationSize = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        changeBootstrapSizeAtMdsAction({ NBootstrap: Number(e.target.value) }),
      );
    },
    [],
  );

  const warningMsg = useMemo(() => {
    return bootstrapSize < 50 ? 'invalid input: larger than 50' : '';
  }, [bootstrapSize]);

  return (
    <>
      <InputFormat
        onChange={onChangeCrossValidationSize}
        type="number"
        value={bootstrapSize}
      />
      <span style={{ color: theme.PRIMARY_3 }}> {warningMsg} </span>
    </>
  );
};

const ConfidentLevelBoxAtMds: React.FC = () => {
  const dispatch = useDispatch();
  const { msdResult } = useSelector<IState, IData>(a => a.data);

  const ci = msdResult.ci;

  const onChangeCrossValidationSize = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(changeConfidentLevelAtMdsAction({ ci: Number(e.target.value) }));
    },
    [],
  );

  const warningMsg = useMemo(() => {
    return ci < 50
      ? 'invalid input: larger than 50'
      : ci > 99
      ? 'invalid input: smaller than 99'
      : '';
  }, [ci]);

  return (
    <>
      <InputFormat
        onChange={onChangeCrossValidationSize}
        type="number"
        value={ci}
      />
      <span style={{ color: theme.PRIMARY_3 }}> {warningMsg} </span>
    </>
  );
};

const OuterProgressBar = styled.div`
  box-sizing: border-box;
  width: 400px;
  height: 10px;
  border-radius: 5px;
  border: 1px solid ${p => p.theme.PRIMARY_1};
`;

const InnerProgressBar = styled.div`
  border-right: 1px solid ${p => p.theme.PRIMARY_1};
  box-sizing: border-box;
  height: 100%;
  background-color: ${p => p.theme.PRIMARY_2};
  border-radius: 5px;
`;

const AnalysisViewContainer = styled.div`
  line-height: 1.2em;
`;

const ConfigIndexTitle = styled.div`
  color: ${p => p.theme.PRIMARY_2};
  margin: 0;
  padding: 5px 0px 5px 15px;
  border-bottom: 1px solid ${p => p.theme.PRIMARY_2};
  border-top: 1px solid ${p => p.theme.PRIMARY_2};
  border-left: 5px solid ${p => p.theme.PRIMARY_2};
  font-weight: bold;
`;

const SubIndex = styled.div`
  padding-left: 20px;
  padding-right: 10px;
  padding-bottom: 10px;
  padding-top: 3px;
`;

interface IProgressBar {
  progress: IProgress;
}

const ProgressBar: React.FC<IProgressBar> = props => {
  return (
    <>
      {` ${props.progress.index}/${props.progress.all}`}
      <OuterProgressBar>
        <InnerProgressBar
          style={{
            width: `${(props.progress.index / props.progress.all) * 100}%`,
          }}></InnerProgressBar>
      </OuterProgressBar>
    </>
  );
};

export const AnalysisView: React.FC = () => {
  const dispatch = useDispatch();
  const {
    estimationParamInput,
    bootstrapProgress,
    crossValidationProgress,
    mdsProgress,
  } = useSelector<IState, IUser>(a => a.user);
  const algorithmList = estimationParamInput.usedAlgorithmList;

  const onToggleAlgorithmList = (algorithmInfo: IAlgorithmInfo) => {
    dispatch(updateAlgorithmListAction(algorithmInfo));
  };

  return (
    <>
      <AnalysisViewContainer>
        <ConfigIndexTitle> cross validation config</ConfigIndexTitle>
        <SubIndex>
          {' '}
          size: <CrossValidationSizeBox />{' '}
        </SubIndex>
        <SubIndex>
          {' '}
          algorithm used:
          <AlgorithmListInput
            algorithmList={algorithmList}
            onChange={onToggleAlgorithmList}
          />
        </SubIndex>

        <ConfigIndexTitle> bootstrap config</ConfigIndexTitle>
        <SubIndex>
          {' '}
          confident level:
          <ConfidentLevelBox />
        </SubIndex>
        <SubIndex>
          {' '}
          bootstrap size:
          <BootstrapSizeBox />
        </SubIndex>
        <ConfigIndexTitle> mds config</ConfigIndexTitle>
        <SubIndex>
          {' '}
          bootstrap Size: <BootstrapSizeBoxAtMds />
        </SubIndex>
        <SubIndex>
          {' '}
          confident level: <ConfidentLevelBoxAtMds />
        </SubIndex>
        <ConfigIndexTitle> progress of computation</ConfigIndexTitle>
        <SubIndex>
          {' '}
          cross validation:
          <ProgressBar progress={crossValidationProgress} />
        </SubIndex>
        <SubIndex>
          {' '}
          bootstrap:
          <ProgressBar progress={bootstrapProgress} />
        </SubIndex>
        <SubIndex>
          {' '}
          mds:
          <ProgressBar progress={mdsProgress} />
        </SubIndex>
        <ConfigIndexTitle> reference </ConfigIndexTitle>
      </AnalysisViewContainer>
    </>
  );
};
