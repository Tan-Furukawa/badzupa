import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeViewAction } from '../actions/UserActions';
import { IState } from '../states/IState';
import IUser from '../states/IUser';
import styled from 'styled-components';

interface IBtn {
  isActive: boolean;
  isWarning: boolean;
}

const ToggleButton = styled.button<IBtn>`
  width: 6em;
  height: 30px;
  border: ${p => (p.isWarning ? 'none' : '1px solid')}
    ${(p): string => (p.isActive ? p.theme.PRIMARY_2 : p.theme.PRIMARY_1)};
  color: ${(p): string =>
    p.isWarning
      ? p.theme.PRIMARY_0
      : p.isActive
      ? p.theme.PRIMARY_2
      : p.theme.PRIMARY_1};
  border-radius: 0;
  margin-left: 2px;
  pointer: cursor;
  background-color: ${(p): string =>
    p.isWarning ? p.theme.PRIMARY_3 : p.theme.PRIMARY_0};
`;

interface IPropsButton {
  label: string; // 表示の名前
  viewId: string; // 表示画面を識別するID
  isWarning?: boolean;
}

export const HeaderIndexButton: React.FC<IPropsButton> = props => {
  const { nowDisplay } = useSelector<IState, IUser>(a => a.user); // -- (a)
  const { viewId } = props;
  const dispatch = useDispatch();
  const onClickHeaderIndex = useCallback(() => {
    dispatch(changeViewAction(viewId));
  }, [viewId]);
  return (
    <>
      <ToggleButton
        isActive={viewId === nowDisplay}
        isWarning={
          props.isWarning === undefined || props.isWarning === false
            ? false
            : true
        }
        onClick={onClickHeaderIndex}>
        {props.label}
      </ToggleButton>
    </>
  );
};

interface IPropsToggle {
  viewId: string;
  Content: React.FC;
}

export const ToggleView: React.FC<IPropsToggle> = props => {
  const { nowDisplay } = useSelector<IState, IUser>(a => a.user); // -- (a)
  const viewId = useMemo(() => {
    return props.viewId;
  }, [props.viewId]);
  const Content = useMemo(() => {
    return props.Content;
  }, [props.Content]);
  console.log(`now displaying::${nowDisplay}`);
  return viewId === nowDisplay ? <Content /> : <></>;
};
