import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeViewAction,
  clearFailedMessageInUserAction,
} from '../actions/UserActions';
import { IState } from '../states/IState';
import IUser from '../states/IUser';
import styled from 'styled-components';
import { ButtonFormat, theme } from './style/FoundationStyles';
import IData from '../states/IData';

interface IDisplayFailedMsg {
  Content: React.FC;
}

export const DisplayFailedMessage: React.FC<IDisplayFailedMsg> = props => {
  const user = useSelector<IState, IUser>(a => a.user);
  const data = useSelector<IState, IData>(a => a.data); // -- (a)
  const Content = useMemo(() => {
    return props.Content;
  }, [props.Content]);
  if (user.failedMessage.length !== 0 || data.failedMessage.length !== 0) {
    return <Content />;
  } else {
    return <></>;
  }
};

export const WarningView: React.FC = () => {
  const dispatch = useDispatch();
  const onclickOK = useCallback(() => {
    dispatch(clearFailedMessageInUserAction());
    dispatch(changeViewAction('register'));
  }, []);
  const user = useSelector<IState, IUser>(a => a.user);
  const data = useSelector<IState, IData>(a => a.data); // -- (a)
  return (
    <>
      {user.failedMessage.map(d => {
        return d.status === 'error' ? (
          <p key={d.id} style={{ color: theme.PRIMARY_3 }}>
            {d.msg}
          </p>
        ) : (
          <p key={d.id} style={{ color: theme.PRIMARY_2 }}>
            {d.msg}
          </p>
        );
      })}
      {data.failedMessage.map(d => {
        return d.status === 'error' ? (
          <p key={d.id} style={{ color: theme.PRIMARY_3 }}>
            {d.msg}
          </p>
        ) : (
          <p key={d.id} style={{ color: theme.PRIMARY_2 }}>
            {d.msg}
          </p>
        );
      })}
      <ButtonFormat onClick={onclickOK}>OK</ButtonFormat>
    </>
  );
};
