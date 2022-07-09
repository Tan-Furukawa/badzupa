import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeUserAction } from '../actions/UserActions';
import { IState } from '../states/IState';
import IUser from '../states/IUser';
import { HeaderIndexButton, ToggleView } from './ToggleView';
import RegisterView from './RegisterView';
import SampleListView from './sampleListView';
import { styled } from './style/FoundationStyles';
import { getSampleList } from '../actions/DataActions';
import { DisplayFailedMessage, WarningView } from './WarningView';
import { AnalysisView } from './AnalysisView';
import { LogView } from './LogView';
import { ResultView } from './ResultView';
import {
  watchBootstrapResult,
  watchCrossValidationResult,
  watchMdsResult,
} from '../actions/watchAction';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { Rings } from 'react-loader-spinner';
import { MdsView } from './MdsView';
import { ButtonFormat, theme } from './style/FoundationStyles';
// #region styled
const MainContainer = styled.div`
  font-family: 'Arial';
  font-size: 13px;
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
`;

const userFormParams = {
  headerSize: 40,
};

const HeaderContainer = styled.div`
  box-sizing: border-box;
  background-color: ${p => p.theme.PRIMARY_0};
  padding-bottom: 20px;
  padding-left: 20px;
  width: 100%;
  height: ${userFormParams.headerSize}px;
  position: fixed;
  top: 0;
  display: flex;
  justify-content: left;
`;

const ContentsContainer = styled.div`
  box-sizing: border-box;
  padding-top: ${userFormParams.headerSize}px;
  padding-left: 20px;
  padding-right: 20px;
  width: 100%;
  height: 100%;
  overflow: scroll;
`;

const RegisterViewContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
`;

const DataLoaderContainer = styled.div`
  box-sizing: border-box;
  flex: 1;
  width: 50%;
  height: 100%;
  position: relative;
`;

const SampleListContainer = styled.div`
  box-sizing: border-box;
  flex: 1;
  width: 50%;
  height: 100%;
  position: relative;
`;

const WarningViewContainer = styled.div`
  padding: 20px;
`;

const ProgressViewContainer = styled.div`
  padding: 20px;
`;

const HeaderWarningButton: React.FC = () => {
  return (
    <HeaderIndexButton label="warning" viewId="warning" isWarning={true} />
  );
};

const RegisterViewSummary: React.FC = () => {
  return (
    <>
      <RegisterViewContainer>
        <DataLoaderContainer>
          <RegisterView />
        </DataLoaderContainer>
        <SampleListContainer>
          <SampleListView />
        </SampleListContainer>
      </RegisterViewContainer>
    </>
  );
};

const WarningViewSummary: React.FC = () => {
  return (
    <>
      <WarningViewContainer>
        <WarningView />
      </WarningViewContainer>
    </>
  );
};

// const MdsViewSummary: React.FC = () => {
//   return (
//     <>
//       <WarningViewContainer>
//         <WarningView />
//       </WarningViewContainer>
//     </>
//   );
// };

const ProgressViewSummary: React.FC = () => {
  return (
    <>
      <ProgressViewContainer>
        <LogView />
      </ProgressViewContainer>
    </>
  );
};

const LoaderStyle = styled.div`
  color: ${p => p.theme.PRIMARY_2};
  cursor: pointer;
  display: flex;
  height: 30px;
`;

interface ILoader {
  onClick: () => void;
}

const Loader: React.FC<ILoader> = props => {
  return (
    <div onClick={props.onClick}>
      <LoaderStyle>
        <Rings
          height="30"
          width="30"
          color={theme.PRIMARY_2}
          ariaLabel="loading"
        />
        <LoaderMsg>stop</LoaderMsg>
      </LoaderStyle>
    </div>
  );
};

const LoaderMsg = styled.span`
  vertical-align: middle;
  padding-top: calc((30px - 1em) / 2);
`;

// データは、Storeから渡されるので、プロパティは必要ありません。
const UserForm: React.FC = () => {
  // initial setting // なんとかならんのか
  // =============================================================
  const dispatch = useDispatch(); // -- (b)
  const { nowComputation } = useSelector<IState, IUser>(a => a.user);
  useEffect(() => {
    watchBootstrapResult(dispatch);
    watchCrossValidationResult(dispatch);
    watchMdsResult(dispatch);
  }, []);
  // setting sample list
  useEffect(() => {
    getSampleList(dispatch);
  }, []);

  const onClickLoader = () => {
    if (window.confirm(`Really restart computation?`)) {
      window.core.restartElectronApp();
      // location.reload();
    }
  };

  return (
    <div>
      <MainContainer>
        initial set up
        <ButtonFormat>start setting</ButtonFormat>
      </MainContainer>
    </div>
  );
};

export default UserForm;
